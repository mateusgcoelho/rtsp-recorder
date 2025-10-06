import type { Camera, CreateCameraRequest, Recording } from "../types/api";

const API_BASE_URL = "http://localhost:8080/api/v1";

class ApiService {
  async getCameras(): Promise<Camera[]> {
    const response = await fetch(`${API_BASE_URL}/cameras`);
    if (!response.ok) {
      throw new Error("Failed to fetch cameras");
    }
    return response.json();
  }

  async createCamera(camera: CreateCameraRequest): Promise<Camera> {
    const response = await fetch(`${API_BASE_URL}/cameras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(camera),
    });
    if (!response.ok) {
      throw new Error("Failed to create camera");
    }
    return response.json();
  }

  async startCameraRecording(cameraId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}/start`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to start recording");
    }
    return response.json();
  }

  async stopCameraRecording(cameraId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}/stop`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to stop recording");
    }
    return response.json();
  }

  async getRecordings(): Promise<Recording[]> {
    const response = await fetch(`${API_BASE_URL}/recordings`);
    if (!response.ok) {
      throw new Error("Failed to fetch recordings");
    }
    return response.json();
  }
}

export const apiService = new ApiService();
