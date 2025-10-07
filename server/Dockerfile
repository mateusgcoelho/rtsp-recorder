FROM golang:1.24 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o ./app ./cmd/api/main.go

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates sqlite3 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /root/

COPY --from=builder /app/app .
RUN mkdir /root/data

CMD ["./app"]
