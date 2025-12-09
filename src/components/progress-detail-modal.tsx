"use client";

interface ProgressDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  weightData: {
    current: number;
    start: number;
    target: number;
    unit: string;
    trend: number;
  };
  weeklyWorkouts: Array<{
    day: string;
    completed: boolean;
    duration: number;
  }>;
}

export default function ProgressDetailModal({
  isOpen,
  onClose,
  weightData,
  weeklyWorkouts,
}: ProgressDetailModalProps) {
  if (!isOpen) return null;

  const totalWorkouts = weeklyWorkouts.filter((w) => w.completed).length;
  const totalDuration = weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-h-[85vh] rounded-t-3xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <h2 className="text-xl font-bold text-gray-900">Progress & Weight</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div
          className="overflow-y-auto px-6 py-6 space-y-6 pb-8"
          style={{ maxHeight: "calc(85vh - 73px)" }}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Weight Summary */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Weight Summary</h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {weightData.current}
                  <span className="text-2xl text-gray-500 ml-2">{weightData.unit}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-lg font-semibold ${weightData.trend < 0 ? "text-green-600" : "text-red-600"}`}>
                    {weightData.trend > 0 ? "+" : ""}
                    {weightData.trend} kg this week
                  </span>
                  {weightData.trend < 0 ? (
                    <span className="text-green-600 text-xl">↓</span>
                  ) : (
                    <span className="text-red-600 text-xl">↑</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-600 mb-2">Starting</div>
                  <div className="text-2xl font-bold text-gray-900">{weightData.start}</div>
                  <div className="text-xs text-gray-500">{weightData.unit}</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-600 mb-2">Lost</div>
                  <div className="text-2xl font-bold text-green-600">
                    {(weightData.start - weightData.current).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">{weightData.unit}</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-600 mb-2">Target</div>
                  <div className="text-2xl font-bold text-blue-600">{weightData.target}</div>
                  <div className="text-xs text-gray-500">{weightData.unit}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">Progress to Goal</span>
                  <span className="text-lg font-bold text-gray-900">
                    {Math.round(
                      ((weightData.start - weightData.current) / (weightData.start - weightData.target)) * 100
                    )}%
                  </span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        ((weightData.start - weightData.current) / (weightData.start - weightData.target)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {(weightData.current - weightData.target).toFixed(1)} kg to go
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Workouts */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Workouts</h3>
            <div className="bg-purple-50 rounded-2xl p-6">
              <div className="grid grid-cols-7 gap-2 mb-6">
                {weeklyWorkouts.map((workout, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600 mb-2">{workout.day}</div>
                    <div
                      className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg font-bold ${
                        workout.completed
                          ? "bg-purple-600 text-white"
                          : "bg-white text-gray-300"
                      }`}
                    >
                      {workout.completed ? "✓" : "·"}
                    </div>
                    {workout.completed && (
                      <div className="text-xs text-gray-600 mt-1">{workout.duration}m</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-600 mb-2">Sessions</div>
                  <div className="text-2xl font-bold text-purple-600">{totalWorkouts}/7</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-600 mb-2">Total Time</div>
                  <div className="text-2xl font-bold text-blue-600">{totalDuration}m</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-600 mb-2">Avg/Session</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(totalDuration / totalWorkouts)}m
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weight History */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Weight History</h3>
            <div className="space-y-3">
              {[
                { date: "Nov 6", weight: 75.5, change: -0.2 },
                { date: "Nov 5", weight: 75.7, change: -0.3 },
                { date: "Nov 4", weight: 76.0, change: -0.1 },
                { date: "Nov 3", weight: 76.1, change: -0.4 },
                { date: "Nov 2", weight: 76.5, change: -0.2 },
                { date: "Nov 1", weight: 76.7, change: -0.3 },
                { date: "Oct 31", weight: 77.0, change: -0.5 },
              ].map((entry, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{entry.date}</div>
                    <div className="text-xs text-gray-500">
                      {entry.change < 0 ? "" : "+"}
                      {entry.change} kg
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{entry.weight} kg</div>
                </div>
              ))}
            </div>
          </div>

          {/* Streak Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Streaks & Achievements</h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Current Streak</div>
                  <div className="text-xs text-gray-600">5 days of logging</div>
                </div>
                <div className="text-2xl font-bold text-orange-600">5d</div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 flex items-center gap-3">
                <span className="text-3xl">💪</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Workout Streak</div>
                  <div className="text-xs text-gray-600">3 consecutive days</div>
                </div>
                <div className="text-2xl font-bold text-purple-600">3d</div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Calorie Goal</div>
                  <div className="text-xs text-gray-600">Hit target 4/7 days</div>
                </div>
                <div className="text-2xl font-bold text-green-600">4/7</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

