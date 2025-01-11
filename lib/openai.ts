import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true, // remove later
});

export async function createThread() {
  const thread = await openai.beta.threads.create();
  return thread;
}

export async function addMessageToThread(threadId: string, content: string) {
  const message = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });
  return message;
}

export async function runAssistant(threadId: string) {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID!,
  });

  return run;
}

export async function checkRunStatus(threadId: string, runId: string) {
  const run = await openai.beta.threads.runs.retrieve(threadId, runId);
  return run;
}

export async function getThreadMessages(threadId: string) {
  const messages = await openai.beta.threads.messages.list(threadId);
  return messages.data;
}
