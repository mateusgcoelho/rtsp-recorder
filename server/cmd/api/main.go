package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mateusgcoelho/rtsp-recorder/recording"
	"github.com/mateusgcoelho/rtsp-recorder/web"
)

func main() {
	err := godotenv.Load(".env.example")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	database, err := web.NewDatabase()
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080/"
	}

	addr := os.Getenv("ADDRESS")
	if addr == "" {
		addr = ":8080"
	}

	worker := recording.NewWorker(baseURL)

	webServer := web.NewServer(addr, database, worker)
	if err := webServer.Start(); err != nil {
		log.Fatalf("failed to start web server: %v", err)
	}
}
