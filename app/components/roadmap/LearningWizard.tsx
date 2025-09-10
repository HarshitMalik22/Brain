'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';

interface LearningWizardProps {
  messages: Array<{ text: string; isUser: boolean }>;
  isTyping: boolean;
  onUserInput: (input: string) => void;
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
}

export function LearningWizard({
  messages,
  isTyping,
  onUserInput,
  currentMessage,
  setCurrentMessage
}: LearningWizardProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="inline-block p-4 bg-[#78be20] minecraft-border">
          <span className="text-4xl">🎮</span>
        </div>
        <h2 className="text-3xl font-bold text-white">Start Your Learning Quest</h2>
        <p className="text-green-400 text-sm max-w-2xl mx-auto">
          I&apos;ll help you build a personalized learning roadmap. Answer a few questions and I&apos;ll craft your perfect learning path!
        </p>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-block minecraft-border p-6"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isUser
                    ? 'bg-[#78be20] text-white'
                    : 'bg-gray-700 text-white'
                    }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer..."
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border-2 border-gray-600 focus:border-[#78be20] focus:outline-none"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!currentMessage.trim() || isTyping}
            className="bg-[#78be20] text-white px-4 py-2 rounded-lg hover:bg-[#5a9a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass-block minecraft-border p-4 text-center"
      >
        <p className="text-green-400 text-xs">
          💡 <strong>Tip:</strong> Be specific about your goals for the best learning roadmap!
        </p>
      </motion.div>
    </div>
  );
}
