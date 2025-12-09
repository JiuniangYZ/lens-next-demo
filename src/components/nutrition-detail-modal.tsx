"use client";

interface NutritionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayData: {
    calories: {
      consumed: number;
      target: number;
      remaining: number;
    };
    macros: {
      protein: { current: number; target: number; unit: string };
      carbs: { current: number; target: number; unit: string };
      fat: { current: number; target: number; unit: string };
    };
    water: {
      current: number;
      target: number;
      unit: string;
    };
  };
}

export default function NutritionDetailModal({
  isOpen,
  onClose,
  todayData,
}: NutritionDetailModalProps) {
  if (!isOpen) return null;

  const caloriePercentage = (todayData.calories.consumed / todayData.calories.target) * 100;
  const proteinPercentage = (todayData.macros.protein.current / todayData.macros.protein.target) * 100;
  const carbsPercentage = (todayData.macros.carbs.current / todayData.macros.carbs.target) * 100;
  const fatPercentage = (todayData.macros.fat.current / todayData.macros.fat.target) * 100;
  const waterPercentage = (todayData.water.current / todayData.water.target) * 100;

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
            <span className="text-2xl">🔥</span>
            <h2 className="text-xl font-bold text-gray-900">Today&apos;s Nutrition</h2>
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
          {/* Calorie Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Calories</h3>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#f3f4f6"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#f97316"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - caloriePercentage / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-gray-900">{todayData.calories.consumed}</div>
                    <div className="text-xs text-gray-500">of {todayData.calories.target}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Target</div>
                  <div className="text-lg font-bold text-gray-900">{todayData.calories.target}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Consumed</div>
                  <div className="text-lg font-bold text-orange-600">{todayData.calories.consumed}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Remaining</div>
                  <div className="text-lg font-bold text-green-600">{todayData.calories.remaining}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Macronutrients Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Macronutrients</h3>
            <div className="space-y-4">
              {/* Protein */}
              <div className="bg-green-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💪</span>
                    <span className="font-semibold text-gray-900">Protein</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {todayData.macros.protein.current}g / {todayData.macros.protein.target}g
                  </span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {Math.round(proteinPercentage)}% of daily goal
                </div>
              </div>

              {/* Carbs */}
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🍚</span>
                    <span className="font-semibold text-gray-900">Carbohydrates</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {todayData.macros.carbs.current}g / {todayData.macros.carbs.target}g
                  </span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {Math.round(carbsPercentage)}% of daily goal
                </div>
              </div>

              {/* Fat */}
              <div className="bg-orange-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🥑</span>
                    <span className="font-semibold text-gray-900">Fat</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {todayData.macros.fat.current}g / {todayData.macros.fat.target}g
                  </span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(fatPercentage, 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {Math.round(fatPercentage)}% of daily goal
                </div>
              </div>
            </div>
          </div>

          {/* Water Intake */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Water Intake</h3>
            <div className="bg-cyan-50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💧</span>
                  <span className="font-semibold text-gray-900">Water</span>
                </div>
                <span className="text-2xl font-bold text-cyan-600">
                  {todayData.water.current} / {todayData.water.target}
                </span>
              </div>
              <div className="h-4 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(waterPercentage, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {Math.round(waterPercentage)}% of daily goal ({todayData.water.target} glasses)
              </div>
            </div>
          </div>

          {/* Meals Today */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Meals Today</h3>
            <div className="space-y-3">
              {[
                { name: "Breakfast", time: "8:30 AM", cal: 520, icon: "🍳" },
                { name: "Lunch", time: "1:15 PM", cal: 680, icon: "🍱" },
                { name: "Snack", time: "4:00 PM", cal: 150, icon: "🍎" },
                { name: "Dinner", time: "7:45 PM", cal: 500, icon: "🍽️" },
              ].map((meal, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meal.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{meal.name}</div>
                      <div className="text-xs text-gray-500">{meal.time}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{meal.cal} cal</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

