"use client";

import { useState, useEffect } from "react";
import NutritionDetailModal from "../nutrition-detail-modal";
import ProgressDetailModal from "../progress-detail-modal";

interface DashboardPageProps {
  onNavigate?: (screen: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  // Modal state
  const [activeModal, setActiveModal] = useState<"nutrition" | "progress" | null>(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeModal]);

  // Dummy data
  const [todayData] = useState({
    calories: {
      consumed: 1850,
      target: 2200,
      remaining: 350,
    },
    macros: {
      protein: { current: 95, target: 150, unit: "g" },
      carbs: { current: 180, target: 250, unit: "g" },
      fat: { current: 65, target: 70, unit: "g" },
    },
    water: {
      current: 6,
      target: 8,
      unit: "glasses",
    },
  });

  const [weeklyWorkouts] = useState([
    { day: "Mon", completed: true, duration: 45 },
    { day: "Tue", completed: false, duration: 0 },
    { day: "Wed", completed: true, duration: 60 },
    { day: "Thu", completed: true, duration: 40 },
    { day: "Fri", completed: false, duration: 0 },
    { day: "Sat", completed: true, duration: 55 },
    { day: "Sun", completed: false, duration: 0 },
  ]);

  const [weightData] = useState({
    current: 75.5,
    start: 78.0,
    target: 72.0,
    unit: "kg",
    trend: -0.5, // Weekly change
  });

  const caloriePercentage = (todayData.calories.consumed / todayData.calories.target) * 100;
  const proteinPercentage = (todayData.macros.protein.current / todayData.macros.protein.target) * 100;
  const carbsPercentage = (todayData.macros.carbs.current / todayData.macros.carbs.target) * 100;
  const fatPercentage = (todayData.macros.fat.current / todayData.macros.fat.target) * 100;
  const waterPercentage = (todayData.water.current / todayData.water.target) * 100;

  const totalWorkouts = weeklyWorkouts.filter((w) => w.completed).length;
  const totalDuration = weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Track your health & fitness</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4 pb-8">
        {/* Card 1: Today's Info - Calories & Nutrition */}
        <div
          onClick={() => setActiveModal("nutrition")}
          className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl">🔥</div>
            <h2 className="text-lg font-bold text-gray-900">Today</h2>
          </div>

          {/* Calories Summary */}
          <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {todayData.calories.consumed}
                <span className="text-sm text-gray-500 font-normal">/{todayData.calories.target}</span>
              </div>
              <div className="text-xs text-gray-500">cal</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-600">{todayData.calories.remaining}</div>
              <div className="text-xs text-gray-500">left</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{Math.round(caloriePercentage)}%</div>
            </div>
          </div>

          {/* Macros - Compact */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">💪 P</div>
              <div className="text-sm font-bold text-green-600">
                {todayData.macros.protein.current}/{todayData.macros.protein.target}
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">🍚 C</div>
              <div className="text-sm font-bold text-blue-600">
                {todayData.macros.carbs.current}/{todayData.macros.carbs.target}
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">🥑 F</div>
              <div className="text-sm font-bold text-orange-600">
                {todayData.macros.fat.current}/{todayData.macros.fat.target}
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${Math.min(fatPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Water */}
          <div className="flex items-center justify-between bg-cyan-50 rounded-xl p-3">
            <span className="text-lg">💧</span>
            <div className="text-sm font-bold text-cyan-600">
              {todayData.water.current}/{todayData.water.target}
            </div>
            <div className="flex-1 mx-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${Math.min(waterPercentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">glasses</div>
          </div>
        </div>

        {/* Card 2: Progress & Weight */}
        <div
          onClick={() => setActiveModal("progress")}
          className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl">⚖️</div>
            <h2 className="text-lg font-bold text-gray-900">Progress</h2>
          </div>

          {/* Weight Info - Compact */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900">
                {weightData.current}
                <span className="text-lg text-gray-500 ml-1">{weightData.unit}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={`text-xs font-semibold ${
                    weightData.trend < 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {weightData.trend > 0 ? "+" : ""}
                  {weightData.trend}
                </span>
                <span className="text-xs text-gray-500">kg/wk</span>
                {weightData.trend < 0 ? (
                  <span className="text-green-600 text-sm">↓</span>
                ) : (
                  <span className="text-red-600 text-sm">↑</span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-gray-500">Start</div>
                <div className="text-sm font-bold text-gray-900">{weightData.start}</div>
              </div>
              <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-gray-500">-{(weightData.start - weightData.current).toFixed(1)}</div>
                <div className="text-sm font-bold text-green-600">Lost</div>
              </div>
              <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
                <div className="text-xs text-gray-500">Goal</div>
                <div className="text-sm font-bold text-blue-600">{weightData.target}</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">→ Goal</span>
              <span className="text-sm font-bold text-gray-900">
                {Math.round(
                  ((weightData.start - weightData.current) / (weightData.start - weightData.target)) * 100
                )}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-600 rounded-full"
                style={{
                  width: `${Math.min(
                    ((weightData.start - weightData.current) / (weightData.start - weightData.target)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex items-center justify-between bg-purple-50 rounded-xl p-3">
            <div className="text-center flex-1">
              <div className="text-xs text-gray-500 mb-1">💪</div>
              <div className="text-lg font-bold text-purple-600">{totalWorkouts}/7</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center flex-1">
              <div className="text-xs text-gray-500 mb-1">⏱️</div>
              <div className="text-lg font-bold text-blue-600">{totalDuration}m</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center flex-1">
              <div className="text-xs text-gray-500 mb-1">🔥</div>
              <div className="text-lg font-bold text-orange-600">5d</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NutritionDetailModal
        isOpen={activeModal === "nutrition"}
        onClose={() => setActiveModal(null)}
        todayData={todayData}
      />

      <ProgressDetailModal
        isOpen={activeModal === "progress"}
        onClose={() => setActiveModal(null)}
        weightData={weightData}
        weeklyWorkouts={weeklyWorkouts}
      />
    </div>
  );
}

