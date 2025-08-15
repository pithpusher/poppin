import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export async function generateEventDescription(
  title: string, 
  category: string, 
  eventType: string, 
  venueName?: string
): Promise<string> {
  try {
    const client = getOpenAIClient();
    
    const prompt = `Generate a compelling, concise event description for:
Title: ${title}
Category: ${category}
Event Type: ${eventType}
Venue: ${venueName || 'our venue'}

Requirements:
- Keep it under 150 characters
- Make it exciting and engaging
- Include relevant details about the event type
- Use natural, conversational language
- Focus on what attendees will experience
- Don't include quotes or special formatting

Description:`;

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('AI generation error:', error);
    if (error instanceof Error && error.message.includes('API key not configured')) {
      throw new Error('AI service not configured. Please contact support.');
    }
    throw new Error('Failed to generate description. Please try again.');
  }
}
