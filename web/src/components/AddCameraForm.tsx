import { useState } from "react";
import type { CreateCameraRequest } from "../types/api";

interface AddCameraFormProps {
  onSubmit: (camera: CreateCameraRequest) => void;
  loading?: boolean;
}

export default function AddCameraForm({
  onSubmit,
  loading = false,
}: AddCameraFormProps) {
  const [name, setName] = useState("");
  const [rtspUrl, setRtspUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && rtspUrl.trim()) {
      onSubmit({ name: name.trim(), rtsp_url: rtspUrl.trim() });
      setName("");
      setRtspUrl("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add New Camera</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Camera Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter camera name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label
            htmlFor="rtspUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            RTSP URL
          </label>
          <input
            type="url"
            id="rtspUrl"
            value={rtspUrl}
            onChange={(e) => setRtspUrl(e.target.value)}
            placeholder="rtsp://example.com/stream"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Camera"}
        </button>
      </form>
    </div>
  );
}
