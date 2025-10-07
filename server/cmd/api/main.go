package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mateusgcoelho/rtsp-recorder/recording"
	"github.com/mateusgcoelho/rtsp-recorder/web"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Printf("Error loading .env file: %v\n", err)
	}

	database, err := web.NewDatabase()
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3030/"
	}

	addr := os.Getenv("ADDRESS")
	if addr == "" {
		addr = ":3030"
	}

	worker := recording.NewWorker(baseURL)

	webServer := web.NewServer(addr, database, worker)
	if err := webServer.Start(); err != nil {
		log.Fatalf("failed to start web server: %v", err)
	}
}
