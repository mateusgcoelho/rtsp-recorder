package models

type CreateCameraRequest struct {
	Name    string `json:"name" binding:"required"`
	RTSPUrl string `json:"rtsp_url" binding:"required,url"`
}
