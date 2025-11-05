'use client';

import { useState } from 'react';
import HomePage from '@/components/real-pages/home';
import ChatPage from '@/components/real-pages/chat';
import DashboardPage from '@/components/real-pages/dashboard';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'chat' | 'dashboard'>('home');

  const navigateToChat = () => {
    setCurrentScreen('chat');
  };

  const navigateToHome = () => {
    setCurrentScreen('home');
  };

  const navigateToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  return (
    <>
      {currentScreen === 'home' && (
        <HomePage 
          onPromptSelect={navigateToChat} 
          onMealLogged={navigateToDashboard}
        />
      )}
      {currentScreen === 'chat' && <ChatPage onBack={navigateToHome} />}
      {currentScreen === 'dashboard' && <DashboardPage />}
    </>
  );
}
