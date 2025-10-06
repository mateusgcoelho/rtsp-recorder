import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import type { Recording } from "../types/api";

interface RecordingListProps {
  recordings: Recording[];
}

export default function RecordingList({ recordings }: RecordingListProps) {
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const handleViewRecording = (recording: Recording) => {
    setSelectedRecording(recording);
  };

  const handleCloseVideo = () => {
    setSelectedRecording(null);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
  };

  useEffect(() => {
    if (selectedRecording && videoRef.current) {
      const video = videoRef.current;
      const hlsUrl = `http://localhost:8080/api/v1/recordings/${selectedRecording.name}`;

      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Check if HLS.js is supported
      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
        });

        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Video is ready but starts paused and muted
          video.muted = true;
          console.log("HLS manifest parsed, video ready to play");
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error("HLS error:", data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log(
                  "Fatal network error encountered, trying to recover"
                );
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Fatal media error encountered, trying to recover");
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = hlsUrl;
        video.muted = true;
        console.log("Using native HLS support");
      } else {
        console.error("HLS is not supported in this browser");
      }
    }
  }, [selectedRecording]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Video Player - Fixed at top when recording is selected */}
      {selectedRecording && (
        <div className="border-b border-gray-200 bg-black">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white text-lg font-medium">
                Playing: {selectedRecording.name}
              </h3>
              <button
                onClick={handleCloseVideo}
                className="text-white hover:text-gray-300 text-xl font-bold px-2 py-1 rounded hover:bg-gray-700"
              >
                ×
              </button>
            </div>
            <video
              ref={videoRef}
              controls
              className="w-full max-h-96 bg-black rounded"
              preload="none"
              muted
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">
          Recordings ({recordings.length})
        </h2>
      </div>
      {recordings.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No recordings found. Start recording from a camera to see recordings
          here.
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {recordings.map((recording) => (
            <div
              key={recording.name}
              className="p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {recording.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Recording ID: {recording.name}
                </p>
              </div>
              <button
                onClick={() => handleViewRecording(recording)}
                className={`ml-4 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  selectedRecording?.name === recording.name
                    ? "bg-gray-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {selectedRecording?.name === recording.name
                  ? "Playing"
                  : "View Recording"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
