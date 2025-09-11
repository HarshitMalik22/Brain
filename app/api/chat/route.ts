import { NextRequest, NextResponse } from 'next/server';
import { ConversationAgent, ChatContext } from '@/app/agents/conversationAgent';

// Define TypeScript interfaces for better type safety
interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: number;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  context: ChatContext;
  createdAt: number;
  updatedAt: number;
}

// =============================================================================
// IN-MEMORY CHAT STORAGE
// =============================================================================
// Why use a Map? Maps provide O(1) time complexity for get/set operations
// and are more efficient than plain objects for this use case.
// 
// IMPORTANT: This is a development-only solution! Data will be lost on server restart.
// For production, replace with a database (Redis, MongoDB, PostgreSQL, etc.)
// =============================================================================
const chatStore = new Map<string, ChatSession>();

// =============================================================================
// MAIN API ENDPOINT: CREATE NEW CHAT SESSION
// =============================================================================
// This endpoint handles POST requests to /api/chat
// Purpose: Create a new chat session with the user's initial message
// 
// Why POST? Because we're creating a new resource (chat session)
// REST best practice: POST for creation, GET for retrieval
// =============================================================================
export async function POST(request: NextRequest) {
  try {
    // =============================================================================
    // STEP 1: PARSE AND VALIDATE REQUEST BODY
    // =============================================================================
    // Why validate? Never trust user input! Validation prevents:
    // - Security vulnerabilities (injection attacks)
    // - Application crashes from malformed data
    // - Unexpected behavior from edge cases
    // =============================================================================
    const { initialMessage } = await request.json();

    // Comprehensive input validation
    if (!initialMessage || typeof initialMessage !== 'string' || initialMessage.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Initial message is required and must be a non-empty string',
          details: 'Please provide a valid message to start the conversation'
        },
        { status: 400 } // HTTP 400 Bad Request - client error
      );
    }

    // =============================================================================
    // STEP 2: GENERATE UNIQUE CHAT IDENTIFIER
    // =============================================================================
    // Why this ID format?
    // - Timestamp (Date.now()): Ensures uniqueness across time
    // - Random string: Prevents collisions from simultaneous requests
    // - 'chat_' prefix: Makes IDs identifiable and readable in logs
    // 
    // Alternative approaches considered:
    // - UUID: More standard but less readable for debugging
    // - Database auto-increment: Simpler but harder to scale horizontally
    // - Hash-based: Deterministic but potentially predictable
    // =============================================================================
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // =============================================================================
    // STEP 3: INITIALIZE CONVERSATION AGENT
    // =============================================================================
    // Why create a new agent for each chat?
    // - Isolation: Each chat session has its own state and context
    // - Scalability: No shared state between different users/chats
    // - Memory Management: Clean separation prevents memory leaks
    // 
    // The ConversationAgent handles:
    // - LLM communication with Groq
    // - Conversation state management
    // - Context preservation across messages
    // =============================================================================
    const agent = new ConversationAgent();

    // =============================================================================
    // STEP 4: PROCESS INITIAL MESSAGE WITH AI
    // =============================================================================
    // Why await? LLM calls are asynchronous and can take several seconds
    // We must wait for the response before proceeding
    // 
    // What happens here:
    // 1. Message is sent to Groq's LLM via LangChain
    // 2. Agent processes the message and maintains conversation state
    // 3. AI generates a response based on the input
    // 4. Response is returned for storage and client delivery
    // =============================================================================
    const initialResponse = await agent.process(initialMessage.trim());

    // =============================================================================
    // STEP 5: CREATE CHAT SESSION DATA STRUCTURE
    // =============================================================================
    // Why this data structure?
    // - Messages array: Chronological conversation history
    // - Timestamps: Enable sorting, analytics, and time-based features
    // - Context preservation: Allows agent to continue conversations
    // - Metadata: Created/updated times for management and debugging
    // 
    // CRITICAL FIX: Changed from array [] to object {} - arrays can't have named properties!
    // =============================================================================
    const chatSession = {
      id: chatId,
      messages: [
        {
          text: initialMessage.trim(),
          isUser: true,
          timestamp: Date.now() // Unix timestamp in milliseconds
        },
        {
          text: initialResponse,
          isUser: false,
          timestamp: Date.now()
        }
      ],
      // Store agent context to continue conversation later
      // This includes the agent's current step, topic, level, etc.
      context: agent.getContext(),
      // Metadata for session management
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // =============================================================================
    // STEP 6: STORE CHAT SESSION
    // =============================================================================
    // Why store in memory? Fast access for development
    // Production consideration: Replace with database for persistence
    // 
    // The chatId is the key, chatSession is the value
    // This allows quick lookup by chatId in subsequent requests
    // =============================================================================
    chatStore.set(chatId, chatSession);

    // =============================================================================
    // STEP 7: RETURN SUCCESS RESPONSE
    // =============================================================================
    // Why return this data?
    // - chatId: Essential for redirecting to the chat page (/chat/[id])
    // - initialResponse: Allows immediate display of AI response
    // - messageCount: Helps with UI state management and progress indicators
    // 
    // HTTP 200 OK: Success status code
    // JSON format: Standard for API responses
    // =============================================================================
    return NextResponse.json({
      chatId,
      initialResponse,
      messageCount: 2, // User message + AI response
      success: true, // Explicit success flag for client-side handling
      timestamp: Date.now() // Response timestamp for client-side sync
    });

  } catch (error) {
    // =============================================================================
    // COMPREHENSIVE ERROR HANDLING
    // =============================================================================
    // Why catch all errors?
    // - Prevents server crashes from unhandled exceptions
    // - Provides consistent error responses to clients
    // - Enables proper logging and monitoring
    // 
    // Error types we might encounter:
    // - JSON parsing errors (malformed request body)
    // - Network errors (Groq API unreachable)
    // - LLM errors (rate limits, invalid responses)
    // - Memory errors (out of memory)
    // =============================================================================
    console.error('Error creating chat session:', error);
    
    // Return user-friendly error message
    // IMPORTANT: Don't expose internal implementation details in production!
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to create chat session. Please try again.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 } // HTTP 500 Internal Server Error
    );
  }
}

// =============================================================================
// OPTIONAL: ADD GET METHOD FOR DEBUGGING/ADMINISTRATION
// =============================================================================
// This could be used to list all active chat sessions
// Remove or secure this in production!
// =============================================================================
export async function GET() {
  try {
    // Convert Map values to array for JSON serialization
    const allSessions = Array.from(chatStore.values());
    
    return NextResponse.json({
      sessions: allSessions,
      count: allSessions.length,
      message: 'This endpoint is for development debugging only'
    });
  } catch (error) {
    console.error('Error retrieving chat sessions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to retrieve chat sessions', details: errorMessage },
      { status: 500 }
    );
  }
}
