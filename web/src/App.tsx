import { useState } from "react";
import AddCameraForm from "./components/AddCameraForm";
import CameraList from "./components/CameraList";
import Navigation from "./components/Navigation";
import RecordingList from "./components/RecordingList";
import { useApi } from "./hooks/useApi";
import type { CreateCameraRequest } from "./types/api";

export default function App() {
  const [activeTab, setActiveTab] = useState<"cameras" | "recordings">(
    "cameras"
  );
  const {
    cameras,
    recordings,
    loading,
    error,
    createCamera,
    startRecording,
    stopRecording,
    fetchRecordings,
  } = useApi();

  const handleCreateCamera = async (camera: CreateCameraRequest) => {
    try {
      await createCamera(camera);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleStartRecording = async (cameraId: number) => {
    try {
      await startRecording(cameraId);
      alert("Recording started successfully!");
    } catch {
      // Error is handled in the hook
    }
  };

  const handleStopRecording = async (cameraId: number) => {
    try {
      await stopRecording(cameraId);
      alert("Recording stopped successfully!");
    } catch {
      // Error is handled in the hook
    }
  };

  const handleTabChange = (tab: "cameras" | "recordings") => {
    setActiveTab(tab);
    if (tab === "recordings") {
      fetchRecordings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {activeTab === "cameras" ? (
          <div className="space-y-6">
            <AddCameraForm onSubmit={handleCreateCamera} loading={loading} />
            <CameraList
              cameras={cameras}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              loading={loading}
            />
          </div>
        ) : (
          <RecordingList recordings={recordings} />
        )}
      </main>
    </div>
  );
}
