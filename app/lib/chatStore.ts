// =============================================================================
// SHARED CHAT STORAGE
// =============================================================================
// Why use a shared module? To ensure all API endpoints access the same data
// 
// IMPORTANT: This is a development-only solution! Data will be lost on server restart.
// For production, replace with a database (Redis, MongoDB, PostgreSQL, etc.)
// =============================================================================

import { ChatContext } from '@/app/agents/conversationAgent';

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  context: ChatContext;
  createdAt: number;
  updatedAt: number;
}

// Shared chat store that can be imported by all API endpoints
export const chatStore = new Map<string, ChatSession>();
