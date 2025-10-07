package web

import (
	"github.com/mateusgcoelho/rtsp-recorder/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type database struct {
	client *gorm.DB
}

func NewDatabase() (*database, error) {
	clientGorm, err := gorm.Open(sqlite.Open("./data/db.sqlite"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	db := &database{client: clientGorm}
	if err := db.Migrate(); err != nil {
		return nil, err
	}

	return db, nil
}

func (d *database) Migrate() error {
	return d.client.AutoMigrate(&models.Camera{})
}
