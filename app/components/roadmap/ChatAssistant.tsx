'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Minimize2, Maximize2, MessageCircle } from 'lucide-react';

interface ChatAssistantProps {
  messages: Array<{ text: string; isUser: boolean }>;
  isTyping: boolean;
  onUserInput: (input: string) => void;
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
}

export function ChatAssistant({
  messages,
  isTyping,
  onUserInput,
  currentMessage,
  setCurrentMessage
}: ChatAssistantProps) {
  const [isMinimized, setIsMinimized] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim() && !isTyping) {
      onUserInput(currentMessage.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed bottom-4 right-4 z-50 ${
        isMinimized ? 'w-auto' : 'w-80 md:w-96'
      }`}
    >
      <div className="glass-block minecraft-border overflow-hidden">
        {/* Header */}
        <div
          className="bg-[#78be20] text-black p-3 cursor-pointer flex items-center justify-between"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-bold">Learning Assistant</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="text-black hover:text-gray-700 transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Chat Content */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-96"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-64">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 minecraft-border ${
                          message.isUser
                            ? 'bg-[#78be20] text-black'
                            : 'bg-[#333333] text-white'
                        }`}
                      >
                        <p className="text-xs whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-start"
                    >
                      <div className="bg-[#333333] text-white px-3 py-2 minecraft-border">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-xs">Thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/20">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your roadmap..."
                    disabled={isTyping}
                    className="flex-1 bg-[#333333] text-white px-3 py-2 minecraft-border text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#78be20] disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!currentMessage.trim() || isTyping}
                    className="minecraft-button bg-[#78be20] hover:bg-[#5a9a1a] text-black px-3 py-2 minecraft-border font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTyping ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </button>
                </form>
              </div>

              {/* Quick Actions */}
              <div className="p-3 border-t border-white/20 bg-[#333333]/50">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onUserInput('Give me more projects')}
                    disabled={isTyping}
                    className="text-xs bg-[#444444] hover:bg-[#555555] text-white px-2 py-1 minecraft-border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    More Projects
                  </button>
                  <button
                    onClick={() => onUserInput('Explain this differently')}
                    disabled={isTyping}
                    className="text-xs bg-[#444444] hover:bg-[#555555] text-white px-2 py-1 minecraft-border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Explain Differently
                  </button>
                  <button
                    onClick={() => onUserInput('What\'s next?')}
                    disabled={isTyping}
                    className="text-xs bg-[#444444] hover:bg-[#555555] text-white px-2 py-1 minecraft-border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    What's Next?
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
