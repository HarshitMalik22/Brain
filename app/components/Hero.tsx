'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call POST /api/chat to create new chat session
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.trim() }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat session');
      }
      
      const { chatId } = await response.json();
      
      // Navigate to the new chat page
      router.push(`/chat/${chatId}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start chat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
        <div className="flex justify-center py-20 min-h-screen">
            <div className="flex flex-col items-center text-black">
                <h1 className="text-9xl font-semibold">
                    Plan <span className="bg-gradient-to-r bg-clip-text text-transparent from-blue-500 via-green-500 to-blue-500 animate-text">anything</span>
                </h1>
                <p className="text-2xl text-gray-400 max-w-4xl py-10 text-center">
                    Transform the way you learn with our intelligent platform that adapts to your unique learning style and helps you master any subject.
                </p>
                <div className="w-full max-w-2xl mt-8">
                    <form onSubmit={handleStartChat} className="relative">
                        <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask me anything..." 
                            className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={!message.trim() || isLoading}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating...' : 'Send'}
                        </button>
                    </form>
                    
                    {error && (
                        <div className="mt-3 text-sm text-red-600 text-center">
                            {error}
                        </div>
                    )}
                    
                    <div className="mt-4 text-sm text-gray-500 text-center">
                        Start a conversation about anything you want to learn!
                    </div>
                </div>
            </div>
        </div>
    )
}