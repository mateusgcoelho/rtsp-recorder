import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import type { Camera, CreateCameraRequest, Recording } from "../types/api";

export function useApi() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingCameras, setRecordingCameras] = useState<Set<number>>(
    new Set()
  );

  const fetchCameras = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCameras();
      setCameras(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cameras");
    } finally {
      setLoading(false);
    }
  };

  const createCamera = async (camera: CreateCameraRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newCamera = await apiService.createCamera(camera);
      setCameras((prev) => [...prev, newCamera]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create camera");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async (cameraId: number) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.startCameraRecording(cameraId);
      setRecordingCameras((prev) => new Set([...prev, cameraId]));
      setCameras((prev) =>
        prev.map((camera) =>
          camera.id === cameraId ? { ...camera, isRecording: true } : camera
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start recording"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stopRecording = async (cameraId: number) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.stopCameraRecording(cameraId);
      setRecordingCameras((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cameraId);
        return newSet;
      });
      setCameras((prev) =>
        prev.map((camera) =>
          camera.id === cameraId ? { ...camera, isRecording: false } : camera
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop recording");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRecordings();
      setRecordings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch recordings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  return {
    cameras,
    recordings,
    loading,
    error,
    recordingCameras,
    fetchCameras,
    createCamera,
    startRecording,
    stopRecording,
    fetchRecordings,
  };
}
