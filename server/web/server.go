package web

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/mateusgcoelho/rtsp-recorder/models"
	"github.com/mateusgcoelho/rtsp-recorder/recording"
)

type server struct {
	addr string

	database *database
	worker   *recording.Worker
}

func NewServer(addr string, database *database, worker *recording.Worker) *server {
	return &server{
		addr:     addr,
		database: database,
		worker:   worker,
	}
}

func (s *server) Start() error {
	r := gin.Default()

	r.Use(cors.Default())

	v1 := r.Group("/api/v1")
	{
		v1.GET("/cameras", s.handleFindCameras)
		v1.POST("/cameras", s.handleCreateCamera)
		v1.POST("/cameras/:id/start", s.handleStartCamera)
		v1.POST("/cameras/:id/stop", s.handleStopCamera)
		v1.GET("/recordings", s.handleFindRecordings)
		v1.GET("/recordings/:id", s.handleGetRecording)
		v1.GET("/recordings/:id/segments/:segmentId", s.handleGetRecordingSegment)
	}

	return r.Run(s.addr)
}

func (s *server) handleFindCameras(c *gin.Context) {
	var cameras []models.Camera = make([]models.Camera, 0)
	if err := s.database.client.Find(&cameras).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch cameras"})
		return
	}

	for i := range cameras {
		cameras[i].IsRecording = s.worker.IsRecording(cameras[i].ID)
	}

	c.JSON(http.StatusOK, cameras)
}

func (s *server) handleCreateCamera(c *gin.Context) {
	var input models.CreateCameraRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}

	camera := models.Camera{Name: input.Name, RTSPUrl: input.RTSPUrl}
	if err := s.database.client.Create(&camera).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create camera"})
		return
	}

	if err := s.worker.Start(camera); err != nil {
		log.Printf("failed to start recording for camera %d: %v", camera.ID, err)
	}

	c.JSON(http.StatusOK, camera)
}

func (s *server) handleFindRecordings(c *gin.Context) {
	recordings := make([]models.Recording, 0)

	rootDir := "./tmp/recordings"

	entries, err := os.ReadDir(rootDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read recordings directory"})
		return
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		playlistPath := fmt.Sprintf("%s/%s/stream.m3u8", rootDir, entry.Name())
		if _, err := os.Stat(playlistPath); err != nil {
			continue
		}

		recording := models.Recording{
			Name: entry.Name(),
		}
		recordings = append(recordings, recording)
	}

	c.JSON(http.StatusOK, recordings)
}

func (s *server) handleStartCamera(c *gin.Context) {
	cameraID := c.Param("id")

	var camera models.Camera
	if err := s.database.client.First(&camera, cameraID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "camera not found"})
		return
	}

	if err := s.worker.Start(camera); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to start recording: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "recording started"})
}

func (s *server) handleStopCamera(c *gin.Context) {
	cameraID := c.Param("id")

	var camera models.Camera
	if err := s.database.client.First(&camera, cameraID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "camera not found"})
		return
	}

	if err := s.worker.Stop(camera.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to stop recording: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "recording stopped"})
}

func (s *server) handleGetRecording(c *gin.Context) {
	recordingID := c.Param("id")
	playlistPath := fmt.Sprintf("./tmp/recordings/%s/stream.m3u8", recordingID)

	if _, err := os.Stat(playlistPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "recording not found"})
		return
	}

	c.File(playlistPath)
}

func (s *server) handleGetRecordingSegment(c *gin.Context) {
	recordingID := c.Param("id")
	segmentID := c.Param("segmentId")
	segmentPath := fmt.Sprintf("./tmp/recordings/%s/%s", recordingID, segmentID)

	log.Printf("Serving segment: %s", segmentPath)

	if _, err := os.Stat(segmentPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "segment not found"})
		return
	}

	c.File(segmentPath)
}
