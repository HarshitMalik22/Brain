'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ConversationAgent } from './agents/conversationAgent';
import { HydrationGuard } from './components/HydrationGuard';
import { Download, User, ArrowRight } from 'lucide-react';

export default function Home() {
  console.log('🔍 [DEBUG] Home component rendering');
  
  const [agent] = useState(() => {
    console.log('🔍 [DEBUG] Creating ConversationAgent');
    return new ConversationAgent();
  });
  const [learningTopic, setLearningTopic] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [roadmap, setRoadmap] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  console.log('🔍 [DEBUG] Rendering client content');

  const handleStartQuest = async () => {
    if (!learningTopic.trim()) return;
    
    setIsTyping(true);
    
    try {
      const response = await agent.process(`I want to learn about ${learningTopic}. Please create a comprehensive learning roadmap for me.`);
      
      // Add agent response
      setMessages([{ text: response, isUser: false }]);
      
      // Check if response contains roadmap
      if (response.includes('##') || response.includes('Module')) {
        setRoadmap(response);
      }
    } catch (error) {
      console.error('Error processing user input:', error);
      setMessages([{ text: 'Sorry, I encountered an error. Please try again.', isUser: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleUserInput = async (input: string) => {
    setIsTyping(true);
    setCurrentMessage('');
    
    // Add user message
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    
    try {
      const response = await agent.process(input);
      
      // Add agent response
      setMessages(prev => [...prev, { text: response, isUser: false }]);
      
      // Check if response contains roadmap
      if (response.includes('##') || response.includes('Module')) {
        setRoadmap(response);
      }
    } catch (error) {
      console.error('Error processing user input:', error);
      setMessages(prev => [...prev, { text: 'Sorry, I encountered an error. Please try again.', isUser: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setRoadmap('');
    setLearningTopic('');
    setCurrentMessage('');
  };

  const suggestedTopics = [
    'AI Agent Development',
    'Data Science',
    'Cybersecurity',
    'Frontend Development',
    'Web3 Development',
    'Cloud Computing'
  ];

  const steps = [
    {
      emoji: '🧠',
      title: 'Choose Topic',
      description: 'Tell us what you want to learn'
    },
    {
      emoji: '🎯',
      title: 'Set Goals',
      description: 'We understand your skill level and timeline'
    },
    {
      emoji: '🚀',
      title: 'Get Roadmap',
      description: 'Receive your personalized learning path'
    }
  ];

  return (
    <HydrationGuard>
      <div className="min-h-screen bg-white" suppressHydrationWarning>
        {/* Header */}
        <header className="border-b border-gray-200 px-6 py-4" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🧠</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Learning Craft</span>
              </motion.div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Home</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Paths</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Download Extension</span>
              </motion.button>
              
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 px-6 py-16" suppressHydrationWarning>
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Craft your learning path
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                block by block
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Tell us what you want to learn, and we&apos;ll guide you with a tailored path based on your goals, skill level, and time.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={learningTopic}
                  onChange={(e) => setLearningTopic(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && learningTopic.trim() && !isTyping) {
                      e.preventDefault();
                      handleStartQuest();
                    }
                  }}
                  placeholder="I want to learn about..."
                  className="input-field flex-1"
                  disabled={isTyping}
                />
                <button
                  onClick={handleStartQuest}
                  disabled={!learningTopic.trim() || isTyping}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Start Quest</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-2 mb-16"
            >
              {suggestedTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => setLearningTopic(topic)}
                  className="tag-chip"
                >
                  {topic}
                </button>
              ))}
            </motion.div>
            
            {/* 3 Steps Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid md:grid-cols-3 gap-6 mb-16"
            >
              {steps.map((step, index) => (
                <div key={index} className="card text-center">
                  <div className="text-4xl mb-4">{step.emoji}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </motion.div>
            
            {/* Roadmap Display */}
            {roadmap && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-left"
              >
                <div className="card mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Learning Roadmap</h2>
                  <div className="prose prose-gray max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">{roadmap}</pre>
                  </div>
                </div>
                
                {/* Continue conversation */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Continue Your Learning Journey</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2 rounded-lg ${message.isUser
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && currentMessage.trim() && !isTyping) {
                          e.preventDefault();
                          handleUserInput(currentMessage.trim());
                        }
                      }}
                      placeholder="Ask about your roadmap or request modifications..."
                      className="input-field flex-1"
                      disabled={isTyping}
                    />
                    <button
                      onClick={() => currentMessage.trim() && !isTyping && handleUserInput(currentMessage.trim())}
                      disabled={!currentMessage.trim() || isTyping}
                      className="btn-primary"
                    >
                      Send
                    </button>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={resetConversation}
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      Start New Quest
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 px-6 py-8" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-600 text-sm">
              Powered by AI • Built with Next.js
            </p>
          </div>
        </footer>
      </div>
    </HydrationGuard>
  );
}
