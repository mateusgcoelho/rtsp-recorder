import type { Camera } from "../types/api";

interface CameraListProps {
  cameras: Camera[];
  onStartRecording: (cameraId: number) => void;
  onStopRecording: (cameraId: number) => void;
  loading?: boolean;
}

export default function CameraList({
  cameras,
  onStartRecording,
  onStopRecording,
  loading = false,
}: CameraListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Cameras ({cameras.length})</h2>
      </div>
      {cameras.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No cameras found. Add your first camera above.
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {cameras.map((camera) => (
            <div
              key={camera.id}
              className="p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {camera.name}
                  </h3>
                  {camera.isRecording && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ● Recording
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1 break-all">
                  {camera.rtsp_url}
                </p>
              </div>
              <div className="ml-4 flex gap-2">
                {!camera.isRecording ? (
                  <button
                    onClick={() => onStartRecording(camera.id)}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Starting..." : "Start Recording"}
                  </button>
                ) : (
                  <button
                    onClick={() => onStopRecording(camera.id)}
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Stopping..." : "Stop Recording"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
