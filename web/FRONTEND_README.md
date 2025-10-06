# RTSP Recorder - Frontend

This is the React frontend for the RTSP Recorder application. It provides a web interface to manage cameras and view recordings.

## Features

- ✅ Add cameras with name and RTSP URL
- ✅ List all cameras
- ✅ Start recording from cameras
- ✅ View list of recordings
- ✅ Clean, responsive UI with Tailwind CSS

## Prerequisites

Make sure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

3. **Make sure the Go backend is running**

   The frontend expects the API server to be running on `http://localhost:8080`

   In the `server` directory, run:

   ```bash
   go run cmd/api/main.go
   ```

4. **Open your browser**

   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

## Project Structure

```
src/
├── components/          # React components
│   ├── Navigation.tsx   # Top navigation bar
│   ├── AddCameraForm.tsx # Form to add new cameras
│   ├── CameraList.tsx   # List of cameras with actions
│   └── RecordingList.tsx # List of recordings
├── hooks/
│   └── useApi.ts        # Custom hook for API calls
├── services/
│   └── api.ts           # API service layer
├── types/
│   └── api.ts           # TypeScript type definitions
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## API Integration

The frontend communicates with the Go backend through the following endpoints:

- `GET /api/v1/cameras` - List all cameras
- `POST /api/v1/cameras` - Create a new camera
- `POST /api/v1/cameras/{id}/start` - Start recording from a camera
- `GET /api/v1/recordings` - List all recordings

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Next Steps

- [ ] Implement video player for recordings
- [ ] Add camera deletion functionality
- [ ] Add recording deletion/management
- [ ] Implement real-time status updates
- [ ] Add pagination for large lists
- [ ] Add search and filters
