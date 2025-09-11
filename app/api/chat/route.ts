import { NextRequest, NextResponse } from 'next/server';
import { ConversationAgent } from '@/app/agents/conversationAgent';
import { timeStamp } from 'console';
let chatStore = new Map<string, any> ();

export async function POST(request: NextRequest){
    try{
        const { initialMessage } = await request.json();

        if (!initialMessage || typeof initialMessage !== 'string' || initialMessage.trim() === ''){
            return NextResponse.json(
                {error: 'Initial message is required and must be a non-empty string'},
                { status: 400 }
            );
        }
    } catch (error){
        return NextResponse.json(
            { error: 'Invalid request body'},
            { status: 400 }
        );
    }

    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const agent = new ConversationAgent();

    const initialResponse = await agent.process(initialMessage.trim());

    const chatSession = [
        id: chatId,
        message: [
            {
                text: initialMessage.trim(),
                isUser: true,
                timeStamp: Date.now()
            },
            {
                text: initialResponse,
                isUser: false,
                timeStamp: Date.now()
            }
        ],
        context: agent.getContext(),
        createdAt: Date.now(),
        updatedAt: Date.now()
    ]

    chatStore.set(chatId, chatSession);
}