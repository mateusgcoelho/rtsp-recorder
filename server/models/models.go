package models

type Camera struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"not null" json:"name"`
	RTSPUrl     string `gorm:"not null;unique" json:"rtsp_url"`
	IsRecording bool   `gorm:"-" json:"isRecording,omitempty"`
}

type Recording struct {
	Name string `json:"name"`
}
