package recording

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"sync"
	"time"

	"github.com/mateusgcoelho/rtsp-recorder/models"
)

const outputDir = "tmp/recordings"

type recordItem struct {
	Cmd *exec.Cmd
}

type Worker struct {
	mu                 sync.Mutex
	camerasInRecording map[uint]*recordItem
	baseURL            string
}

func NewWorker(baseURL string) *Worker {
	return &Worker{
		camerasInRecording: make(map[uint]*recordItem),
		baseURL:            baseURL,
	}
}

func (w *Worker) Stop(cameraID uint) error {
	w.mu.Lock()
	defer w.mu.Unlock()

	item, exists := w.camerasInRecording[cameraID]
	if !exists {
		return fmt.Errorf("camera %d is not being recorded", cameraID)
	}

	if item.Cmd != nil && item.Cmd.Process != nil {
		if err := item.Cmd.Process.Kill(); err != nil {
			log.Printf("failed to kill ffmpeg process for camera %d: %v", cameraID, err)
		}
	}

	delete(w.camerasInRecording, cameraID)
	log.Printf("stopped recording for camera %d", cameraID)

	return nil
}

func (w *Worker) Start(camera models.Camera) error {
	w.mu.Lock()
	defer w.mu.Unlock()

	if _, exists := w.camerasInRecording[camera.ID]; exists {
		return fmt.Errorf("camera %d is already being recorded", camera.ID)
	}

	output, err := prepareOutput(camera.ID)
	if err != nil {
		return err
	}

	w.camerasInRecording[camera.ID] = &recordItem{Cmd: nil}

	go w.runRecording(camera, output)

	return nil
}

func (w *Worker) IsRecording(cameraID uint) bool {
	w.mu.Lock()
	defer w.mu.Unlock()

	_, exists := w.camerasInRecording[cameraID]
	return exists
}

func prepareOutput(cameraID uint) (OutputRecording, error) {
	recordingId := fmt.Sprintf("%d-%d", cameraID, time.Now().Unix())
	path := fmt.Sprintf("%s/%s", outputDir, recordingId)

	if err := os.MkdirAll(path, 0755); err != nil {
		return OutputRecording{}, fmt.Errorf("failed to create output directory: %w", err)
	}

	playlistPath := fmt.Sprintf("%s/stream.m3u8", path)
	return OutputRecording{Path: path, PlaylistPath: playlistPath, ID: recordingId}, nil
}

func (w *Worker) runRecording(camera models.Camera, output OutputRecording) {
	defer func() {
		w.mu.Lock()
		delete(w.camerasInRecording, camera.ID)
		w.mu.Unlock()
		log.Printf("cleaned up recording for camera %d", camera.ID)
	}()

	segmentsURL := fmt.Sprintf("%s/api/v1/recordings/%s/segments/", w.baseURL, output.ID)
	args := []string{
		"-i", camera.RTSPUrl,
		"-c:v", "copy",
		"-c:a", "aac",
		"-f", "hls",
		"-hls_time", "5",
		"-hls_base_url", segmentsURL,
		output.PlaylistPath,
	}

	log.Printf("starting ffmpeg with args: %v", args)

	cmd := exec.Command("ffmpeg", args...)

	logFile, err := openLogFile(output.Path)
	if err != nil {
		log.Printf("failed to open log file for camera %d: %v", camera.ID, err)
		return
	}
	defer logFile.Close()

	cmd.Stdout = logFile
	cmd.Stderr = logFile

	w.mu.Lock()
	if item, exists := w.camerasInRecording[camera.ID]; exists {
		item.Cmd = cmd
	} else {
		w.mu.Unlock()
		log.Printf("recording slot for camera %d was removed, aborting", camera.ID)
		return
	}
	w.mu.Unlock()

	if err := cmd.Start(); err != nil {
		log.Printf("failed to start ffmpeg for camera %d: %v", camera.ID, err)
		return
	}

	log.Printf("started recording for camera %d, saving to %s", camera.ID, output.Path)

	if err := cmd.Wait(); err != nil {
		log.Printf("ffmpeg command ended with error for camera %d: %v", camera.ID, err)
	} else {
		log.Printf("ffmpeg command ended successfully for camera %d", camera.ID)
	}
}

func openLogFile(path string) (*os.File, error) {
	return os.OpenFile(fmt.Sprintf("%s/ffmpeg.log", path),
		os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
}
