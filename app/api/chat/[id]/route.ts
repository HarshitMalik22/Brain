import { NextRequest, NextResponse } from "next/server";
import { ConversationAgent, ChatContext } from "@/app/agents/conversationAgent";

interface ChatMessage{
    text: string;
    isUser: boolean;
    timestamp: number;
}

interface ChatSession{
    id: string;
    messages: ChatMessage[];
    context: ChatContext;
    createdAt: number;
    updatedAt: number;
}

let chatStore = new Map<string, ChatSession>();

// =============================================================================
// GET METHOD: RETRIEVE CHAT SESSION
// =============================================================================
// Purpose: Load existing chat session by ID
// URL: GET /api/chat/[id]
// 
// Why GET? Because we're retrieving an existing resource
// REST best practice: GET for retrieval, should be idempotent
// =============================================================================
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const chatId = params.id;
      
      // Retrieve chat session from storage
      const chatSession = chatStore.get(chatId);
      
      // Handle case where chat session doesn't exist
      if (!chatSession) {
        return NextResponse.json(
          { 
            error: 'Chat session not found',
            details: `No chat session found with ID: ${chatId}`
          },
          { status: 404 } // HTTP 404 Not Found
        );
      }
      
      // Return the complete chat session
      return NextResponse.json(chatSession);
      
    } catch (error) {
      console.error('Error retrieving chat session:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return NextResponse.json(
        { 
          error: 'Failed to retrieve chat session. Please try again.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 } // HTTP 500 Internal Server Error
      );
    }
  }

  // =============================================================================
// POST METHOD: CONTINUE CONVERSATION
// =============================================================================
// Purpose: Add new message to existing chat session and get AI response
// URL: POST /api/chat/[id]
// 
// Why POST? Because we're modifying an existing resource (adding messages)
// REST best practice: POST for modifications that aren't standard PUT/PATCH
// =============================================================================
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const chatId = params.id;
      const { message } = await request.json();
      
      // =============================================================================
      // INPUT VALIDATION
      // =============================================================================
      // Why validate? Never trust user input! Prevents security issues and crashes
      // =============================================================================
      if (!message || typeof message !== 'string' || message.trim() === '') {
        return NextResponse.json(
          { 
            error: 'Message is required and must be a non-empty string',
            details: 'Please provide a valid message to continue the conversation'
          },
          { status: 400 } // HTTP 400 Bad Request
        );
      }
      
      // =============================================================================
      // CHAT SESSION RETRIEVAL
      // =============================================================================
      // Retrieve existing session - fail fast if it doesn't exist
      const chatSession = chatStore.get(chatId);
      if (!chatSession) {
        return NextResponse.json(
          { 
            error: 'Chat session not found',
            details: `No chat session found with ID: ${chatId}`
          },
          { status: 404 } // HTTP 404 Not Found
        );
      }
      
      // =============================================================================
      // CONTEXT RESTORATION
      // =============================================================================
      // CRITICAL: Restore the agent's previous conversation state
      // Without this, the AI won't remember the previous conversation!
      const agent = new ConversationAgent();
      agent.setContext(chatSession.context);
      
      // =============================================================================
      // MESSAGE PROCESSING
      // =============================================================================
      // Send the new message to the AI and get response
      // This is where the actual AI conversation happens
      const response = await agent.process(message.trim());
      
      // =============================================================================
      // SESSION UPDATE
      // =============================================================================
      // Add both user message and AI response to the conversation history
      chatSession.messages.push(
        {
          text: message.trim(),
          isUser: true,
          timestamp: Date.now() // Current timestamp
        },
        {
          text: response,
          isUser: false,
          timestamp: Date.now() // Current timestamp
        }
      );
      
      // Update the agent's context and session metadata
      chatSession.context = agent.getContext();
      chatSession.updatedAt = Date.now();
      
      // =============================================================================
      // PERSIST CHANGES
      // =============================================================================
      // Save the updated session back to storage
      chatStore.set(chatId, chatSession);
      
      // =============================================================================
      // RETURN SUCCESS RESPONSE
      // =============================================================================
      // Return the updated session data to the client
      return NextResponse.json({
        response, // The AI's response to the new message
        messages: chatSession.messages, // Complete message history
        context: chatSession.context, // Updated agent context
        updatedAt: chatSession.updatedAt, // Last update timestamp
        messageCount: chatSession.messages.length // Total message count
      });
      
    } catch (error) {
      // =============================================================================
      // COMPREHENSIVE ERROR HANDLING
      // =============================================================================
      console.error('Error processing chat message:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return NextResponse.json(
        { 
          error: 'Failed to process chat message. Please try again.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 } // HTTP 500 Internal Server Error
      );
    }
  }