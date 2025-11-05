"use client";

import { useState } from "react";

interface MealLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMealLogged: () => void;
}

interface MealItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  emoji: string;
  quantity: number;
}

export default function MealLogModal({ isOpen, onClose, onMealLogged }: MealLogModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  
  // Single meal with multiple items
  const [mealItems, setMealItems] = useState<MealItem[]>([
    {
      id: 1,
      name: "Big Mac",
      calories: 550,
      protein: 25,
      fat: 30,
      carbs: 45,
      emoji: "🍔",
      quantity: 1,
    },
    {
      id: 2,
      name: "Medium Fries",
      calories: 340,
      protein: 4,
      fat: 16,
      carbs: 44,
      emoji: "🍟",
      quantity: 1,
    },
    {
      id: 3,
      name: "Coca-Cola (M)",
      calories: 210,
      protein: 0,
      fat: 0,
      carbs: 58,
      emoji: "🥤",
      quantity: 1,
    },
  ]);

  if (!isOpen) return null;

  const updateQuantity = (id: number, delta: number) => {
    setMealItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const calculateTotals = () => {
    return mealItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories * item.quantity,
        protein: acc.protein + item.protein * item.quantity,
        fat: acc.fat + item.fat * item.quantity,
        carbs: acc.carbs + item.carbs * item.quantity,
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  const handleLogMeal = () => {
    const activeMealItems = mealItems.filter((item) => item.quantity > 0);
    console.log("Logging meal:", activeMealItems);
    // TODO: Handle actual meal logging
    
    // Trigger fade-out animation
    setIsClosing(true);
    
    // After animation completes, close modal and navigate to dashboard
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      // Small delay before showing dashboard for smoother transition
      setTimeout(() => {
        onMealLogged();
      }, 100);
    }, 300); // Match animation duration
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ${
          isClosing ? "translate-y-full" : "translate-y-0 animate-slide-up"
        }`}
      >
        {/* Header */}
        <div className="flex-none px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              McDonald&apos;s Meal
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Adjust quantities and confirm
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Meal Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4 pb-4">
            {mealItems.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 shadow-md border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  {/* Emoji Icon */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-3xl">{item.emoji}</div>
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="text-red-600 font-semibold">
                        {item.calories * item.quantity} cal
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-green-600 font-semibold">
                        {item.protein * item.quantity}g protein
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary + Log Button */}
        <div className="flex-none px-6 py-4 border-t border-gray-200 bg-white">
          {/* Totals */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 mb-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Total Nutrition
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {totals.calories}
                </div>
                <div className="text-xs text-gray-600">cal</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {totals.protein}g
                </div>
                <div className="text-xs text-gray-600">protein</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {totals.fat}g
                </div>
                <div className="text-xs text-gray-600">fat</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {totals.carbs}g
                </div>
                <div className="text-xs text-gray-600">carbs</div>
              </div>
            </div>
          </div>

          {/* Log Button */}
          <button
            onClick={handleLogMeal}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 active:bg-gray-700 transition-colors shadow-lg"
          >
            🔧 Log It
          </button>
        </div>
      </div>
    </div>
  );
}
