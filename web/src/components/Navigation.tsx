interface NavigationProps {
  activeTab: "cameras" | "recordings";
  onTabChange: (tab: "cameras" | "recordings") => void;
}

export default function Navigation({
  activeTab,
  onTabChange,
}: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">RTSP Recorder</h1>
          </div>
          <div className="flex space-x-8">
            <button
              onClick={() => onTabChange("cameras")}
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                activeTab === "cameras"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Cameras
            </button>
            <button
              onClick={() => onTabChange("recordings")}
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                activeTab === "recordings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Recordings
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
