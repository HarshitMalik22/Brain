import { NextRequest, NextResponse } from 'next/server';
import { ConversationAgent } from '@/app/agents/conversationAgent';
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
}