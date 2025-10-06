export interface Camera {
  id: number;
  name: string;
  rtsp_url: string;
  isRecording?: boolean;
}

export interface CreateCameraRequest {
  name: string;
  rtsp_url: string;
}

export interface Recording {
  name: string;
}
