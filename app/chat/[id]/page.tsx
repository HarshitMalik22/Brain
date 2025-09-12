'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatMessage, ChatSession } from '@/app/lib/chatStore';

interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
}

export default function ChatPage() {
  // =============================================================================
  // ROUTE PARAMETERS & NAVIGATION
  // =============================================================================
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // =============================================================================
  // INITIAL CHAT SESSION LOADING
  // =============================================================================
  useEffect(() => {
    loadChatSession();
    loadChatHistory();
  }, [chatId]);

  const loadChatSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/chat/${chatId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Chat session not found');
          return;
        }
        throw new Error('Failed to load chat session');
      }
      
      const session: ChatSession = await response.json();
      setChatSession(session);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat session');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatHistory = async () => {
    // Mock chat history for now - in production this would come from an API
    const mockHistory: ChatHistoryItem[] = [
      {
        id: '1',
        title: 'Python Programming',
        lastMessage: 'Let\'s start with variables and data types...',
        timestamp: Date.now() - 3600000
      },
      {
        id: '2',
        title: 'Machine Learning Basics',
        lastMessage: 'Understanding supervised vs unsupervised learning',
        timestamp: Date.now() - 7200000
      },
      {
        id: '3',
        title: 'Web Development',
        lastMessage: 'HTML, CSS, and JavaScript fundamentals',
        timestamp: Date.now() - 86400000
      }
    ];
    setChatHistory(mockHistory);
  };

  // =============================================================================
  // MESSAGE SENDING FUNCTIONALITY
  // =============================================================================
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending || !chatSession) return;
    
    try {
      setIsSending(true);
      setError(null);
      
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.trim() }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const updatedSession: ChatSession = await response.json();
      setChatSession(updatedSession);
      setMessage('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // =============================================================================
  // LOADING STATE UI
  // =============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading chat session...</p>
        </div>
      </div>
    );
  }

  // =============================================================================
  // ERROR STATE UI
  // =============================================================================
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center backdrop-blur-xl bg-white/30 rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-2xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // =============================================================================
  // SAFETY CHECK
  // =============================================================================
  if (!chatSession) {
    return null;
  }

  // =============================================================================
  // MAIN CHAT INTERFACE
  // =============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex">
      {/* Sidebar */}
      <div className={`
        w-80 bg-white/20 backdrop-blur-xl border-r border-white/20 transition-all duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed lg:relative h-full z-20
      `}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Learning Paths</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-2xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg font-medium"
          >
            + New Chat
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto h-[calc(100vh-120px)]">
          <div className="space-y-3">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => router.push(`/chat/${chat.id}`)}
                className={`
                  p-4 rounded-2xl cursor-pointer transition-all duration-300
                  backdrop-blur-sm border border-white/20 hover:bg-white/30
                  ${chat.id === chatId ? 'bg-white/40 shadow-lg' : 'bg-white/10'}
                `}
              >
                <h3 className="font-semibold text-gray-800 mb-1 truncate">{chat.title}</h3>
                <p className="text-sm text-gray-600 truncate mb-2">{chat.lastMessage}</p>
                <p className="text-xs text-gray-500">{formatDate(chat.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-800"
              >
                ☰
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Learning Assistant
                </h1>
                <p className="text-sm text-gray-600">
                  {chatSession.messages[0]?.text.substring(0, 50) || 'New Chat'}...
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 rounded-xl hover:bg-white/20"
            >
              ← Back to Home
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {chatSession.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-md lg:max-w-lg px-6 py-4 rounded-3xl shadow-lg
                      backdrop-blur-sm border border-white/20 transition-all duration-300
                      ${msg.isUser
                        ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-br-none'
                        : 'bg-white/40 text-gray-800 rounded-bl-none'
                      }
                    `}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                    <p
                      className={`
                        text-xs mt-2 opacity-70
                        ${msg.isUser ? 'text-blue-100' : 'text-gray-600'}
                      `}
                    >
                      {formatTimestamp(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white/40 text-gray-800 px-6 py-4 rounded-3xl rounded-bl-none shadow-lg backdrop-blur-sm border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white/10 backdrop-blur-xl border-t border-white/20">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <form onSubmit={sendMessage} className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="
                    w-full px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-sm
                    border border-white/20 text-gray-800 placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                    transition-all duration-300 shadow-lg
                  "
                  disabled={isSending}
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className="
                  bg-gradient-to-r from-green-500 to-blue-600 text-white
                  px-8 py-4 rounded-2xl hover:from-green-600 hover:to-blue-700
                  disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                  transition-all duration-300 shadow-lg font-medium
                "
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </form>
            
            {error && (
              <div className="mt-3 text-sm text-red-600 bg-red-50/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-red-200">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}