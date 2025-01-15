import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/serverAuth";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  // Verify user session
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { threadId, message, userId } = await request.json();

    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Run assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID!,
      // Optional: add metadata or instructions
      metadata: {
        userId: userId,
      },
    });

    // Poll for run completion
    let runStatus;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    } while (!["completed", "failed", "cancelled"].includes(runStatus.status));

    // If run is completed, retrieve messages
    if (runStatus.status === "completed") {
      const messages = await openai.beta.threads.messages.list(threadId);

      // Format messages
      const formattedMessages = messages.data.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content.map((c) =>
          c.type === "text" ? c.text.value : ""
        ),
      }));

      return NextResponse.json({
        messages: formattedMessages,
        status: runStatus.status,
      });
    }

    return NextResponse.json({
      messages: [],
      status: runStatus.status,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Verify user session
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create a new thread
    const thread = await openai.beta.threads.create();
    return NextResponse.json({ threadId: thread.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}
