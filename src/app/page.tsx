'use client';

import { useState } from 'react';
import HomePage from '@/components/real-pages/home';
import ChatPage from '@/components/real-pages/chat';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'chat'>('home');

  const navigateToChat = () => {
    setCurrentScreen('chat');
  };

  const navigateToHome = () => {
    setCurrentScreen('home');
  };

  return (
    <>
      {currentScreen === 'home' && <HomePage onPromptSelect={navigateToChat} />}
      {currentScreen === 'chat' && <ChatPage onBack={navigateToHome} />}
    </>
  );
}
