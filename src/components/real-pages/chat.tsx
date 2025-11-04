"use client";

import { useState, useEffect, useRef } from "react";

interface ChatPageProps {
  onBack: () => void;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage({ onBack }: ChatPageProps) {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentCard, setCurrentCard] = useState<'meal' | 'train'>('meal');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false); // Global lock
  const hasInitialized = useRef(false); // Prevent double initialization
  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling

  // Unified message sending function with lock-response-unlock pattern
  const sendMsg = (userMessage: string, isTrainingRequest: boolean = false) => {
    if (isAiTyping) return; // Respect the lock
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAiTyping(true); // 🔒 Lock
    
    if (!isTrainingRequest) {
      // First question: "Should I eat this?"
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "You can definitely enjoy this Big Mac! 🍔 However, to keep things balanced and maintain your fitness goals, it would be best to follow it up with some training. A good workout will help you burn those extra calories and make the most of that protein. Want me to plan a workout for you?"
          }
        ]);
        setIsAiTyping(false); // 🔓 Unlock
      }, 1800);
    } else {
      // Training request: "Plan me a train"
      // AI "thinks" before switching card
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentCard('train');
          setIsTransitioning(false);
        }, 300);
      }, 800);
      
      // Add AI response after card transition
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "Perfect! 💪 I've created a post-meal strength training plan for you. This 45-minute workout will help you burn approximately 350 calories and make the most of that protein from your Big Mac. Focus on proper form and rest 90-120 seconds between sets. Let's get those gains!"
          }
        ]);
        setIsAiTyping(false); // 🔓 Unlock
      }, 2100);
    }
  };

  // Start the conversation flow on mount (only once, not twice in strict mode)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      sendMsg('🤔 Should I eat this?');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Dynamic suggestions based on messages length (after AI responds to first question)
  const suggestedQuestions = messages.length >= 2
    ? ["💪 Plan me a train"] 
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Add user message
      setMessages([...messages, { role: 'user', content: inputValue }]);
      // TODO: Handle AI response
      setInputValue("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.includes("Plan me a train")) {
      sendMsg(suggestion, true); // true = training request
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white flex flex-col">
      {/* Header */}
      <div className="flex-none px-4 py-4 border-b border-gray-200 flex items-center gap-3 bg-white z-10">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-black">Chat</h1>
      </div>

      {/* Context Card - Switchable */}
      <div className="flex-none px-4 py-3">
        <div 
          className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        >
          {currentCard === 'meal' ? (
            // Meal Card
            <div className="bg-gradient-to-br from-yellow-50 to-red-50 rounded-3xl p-3 shadow-lg border border-yellow-200">
            {/* First Row: Burger Image + Basic Info */}
            <div className="flex items-start gap-3 mb-3 pb-3 border-b border-yellow-200">
              {/* Burger Image - Smaller */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="text-3xl">🍔</div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                  Big Mac
                </h2>
                <p className="text-xs text-gray-600 mb-2">
                  McDonald&apos;s • Classic Burger
                </p>
                <div className="flex gap-2.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-bold text-red-600">550</span>
                    <span className="text-xs text-gray-600">cal</span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-base font-semibold text-green-600">25g</span>
                    <span className="text-xs text-gray-600">protein</span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-base font-semibold text-orange-600">30g</span>
                    <span className="text-xs text-gray-600">fat</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Nutrition Information */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Nutrition Facts</h3>
              
              {/* Main Nutrients */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700">Carbohydrates</span>
                  <span className="text-xs font-semibold text-gray-900">45g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700">Saturated Fat</span>
                  <span className="text-xs font-semibold text-gray-900">11g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700">Sodium</span>
                  <span className="text-xs font-semibold text-gray-900">1010mg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700">Sugar</span>
                  <span className="text-xs font-semibold text-gray-900">9g</span>
                </div>
              </div>

              {/* Ingredients */}
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-2.5">
                <div className="text-xs text-gray-600 leading-snug">
                  <span className="font-semibold text-gray-700">Ingredients: </span>
                  Big Mac Bun, 100% Beef Patty, Shredded Lettuce, Big Mac Sauce, 
                  American Cheese, Pickles, Onions
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Training Card
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-3 shadow-lg border border-blue-200">
            {/* First Row: Icon + Basic Info */}
            <div className="flex items-start gap-3 mb-3 pb-3 border-b border-blue-200">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="text-3xl">💪</div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                  Post-Meal Training
                </h2>
                <p className="text-xs text-gray-600 mb-2">
                  Strength Training • 45 mins
                </p>
                <div className="flex gap-2.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-bold text-blue-600">350</span>
                    <span className="text-xs text-gray-600">cal burn</span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-base font-semibold text-purple-600">4</span>
                    <span className="text-xs text-gray-600">exercises</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Workout Plan</h3>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700">🏋️ Bench Press</span>
                  <span className="text-xs font-semibold text-gray-900">4 × 8-10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700">💪 Dumbbell Rows</span>
                  <span className="text-xs font-semibold text-gray-900">3 × 12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700">🦵 Squats</span>
                  <span className="text-xs font-semibold text-gray-900">4 × 10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700">🔥 Deadlifts</span>
                  <span className="text-xs font-semibold text-gray-900">3 × 8</span>
                </div>
              </div>

              {/* Training Notes */}
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-2.5">
                <div className="text-xs text-gray-600 leading-snug">
                  <span className="font-semibold text-gray-700">Note: </span>
                  Rest 90-120s between sets. Focus on protein intake post-workout 
                  to maximize recovery with your Big Mac meal.
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Tap a suggestion or ask your own question
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-black'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {/* Invisible element at the bottom for auto-scrolling */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggestion Bubbles - Above Input */}
      <div className="flex-none px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(question)}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 active:bg-gray-300 transition-colors border border-gray-200"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none px-4 pb-4">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative w-full">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 rounded-full bg-gray-100 border-none outline-none text-black placeholder-gray-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
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
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

