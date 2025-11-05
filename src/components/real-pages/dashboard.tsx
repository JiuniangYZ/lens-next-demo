"use client";

import { useState } from "react";

interface DashboardPageProps {
  onNavigate?: (screen: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
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
      <div className="px-6 py-6 space-y-6 pb-8">
        {/* Calorie Card - Hero */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 shadow-xl text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold opacity-90">Today&apos;s Calories</h2>
              <p className="text-sm opacity-75 mt-1">
                {todayData.calories.remaining} cal remaining
              </p>
            </div>
            <div className="text-4xl">🔥</div>
          </div>

          {/* Circular Progress */}
          <div className="flex items-center justify-center my-6">
            <div className="relative w-48 h-48">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="16"
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="white"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - caloriePercentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold">{todayData.calories.consumed}</div>
                <div className="text-sm opacity-75">/ {todayData.calories.target}</div>
                <div className="text-xs opacity-60 mt-1">calories</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{Math.round(caloriePercentage)}%</div>
              <div className="text-xs opacity-75 mt-1">Progress</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs opacity-75 mt-1">Meals</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">
                {todayData.water.current}/{todayData.water.target}
              </div>
              <div className="text-xs opacity-75 mt-1">Water</div>
            </div>
          </div>
        </div>

        {/* Macros Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Macronutrients</h2>
            <div className="text-2xl">🍽️</div>
          </div>

          <div className="space-y-4">
            {/* Protein */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Protein</span>
                <span className="text-sm font-bold text-green-600">
                  {todayData.macros.protein.current}g / {todayData.macros.protein.target}g
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Carbs</span>
                <span className="text-sm font-bold text-blue-600">
                  {todayData.macros.carbs.current}g / {todayData.macros.carbs.target}g
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Fat</span>
                <span className="text-sm font-bold text-orange-600">
                  {todayData.macros.fat.current}g / {todayData.macros.fat.target}g
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(fatPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Water */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">💧 Water</span>
                <span className="text-sm font-bold text-cyan-600">
                  {todayData.water.current} / {todayData.water.target} glasses
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(waterPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Workout Summary Card */}
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl p-6 shadow-xl text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold opacity-90">Weekly Workouts</h2>
              <p className="text-sm opacity-75 mt-1">
                {totalWorkouts} sessions • {totalDuration} mins
              </p>
            </div>
            <div className="text-4xl">💪</div>
          </div>

          {/* Weekly Calendar */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weeklyWorkouts.map((workout, index) => (
              <div key={index} className="text-center">
                <div className="text-xs opacity-75 mb-2">{workout.day}</div>
                <div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold ${
                    workout.completed
                      ? "bg-white text-purple-600"
                      : "bg-white/20 text-white/50"
                  }`}
                >
                  {workout.completed ? "✓" : "·"}
                </div>
                {workout.completed && (
                  <div className="text-xs opacity-75 mt-1">{workout.duration}m</div>
                )}
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{totalWorkouts}/7</div>
              <div className="text-xs opacity-75 mt-1">Days</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{totalDuration}</div>
              <div className="text-xs opacity-75 mt-1">Minutes</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{Math.round(totalDuration / totalWorkouts)}</div>
              <div className="text-xs opacity-75 mt-1">Avg/Day</div>
            </div>
          </div>
        </div>

        {/* Weight Tracking Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Weight Progress</h2>
            <div className="text-2xl">⚖️</div>
          </div>

          {/* Current Weight - Large Display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {weightData.current}
              <span className="text-2xl text-gray-500 ml-2">{weightData.unit}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  weightData.trend < 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {weightData.trend > 0 ? "+" : ""}
                {weightData.trend} kg this week
              </span>
              {weightData.trend < 0 ? (
                <span className="text-green-600">↓</span>
              ) : (
                <span className="text-red-600">↑</span>
              )}
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Start</div>
              <div className="text-lg font-bold text-gray-900">
                {weightData.start}
                <span className="text-xs text-gray-500 ml-1">{weightData.unit}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Lost</div>
              <div className="text-lg font-bold text-green-600">
                {(weightData.start - weightData.current).toFixed(1)}
                <span className="text-xs text-gray-500 ml-1">{weightData.unit}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Target</div>
              <div className="text-lg font-bold text-blue-600">
                {weightData.target}
                <span className="text-xs text-gray-500 ml-1">{weightData.unit}</span>
              </div>
            </div>
          </div>

          {/* Progress to Goal */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-600">Progress to Goal</span>
              <span className="text-xs font-bold text-gray-900">
                {Math.round(
                  ((weightData.start - weightData.current) / (weightData.start - weightData.target)) *
                    100
                )}
                %
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    ((weightData.start - weightData.current) / (weightData.start - weightData.target)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

