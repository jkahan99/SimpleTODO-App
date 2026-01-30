import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: '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' // We'll fix this later!
  ,dangerouslyAllowBrowser: true
}
);

export async function generateWittyNotification(todoTitle: string): Promise<string> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Generate a single funny, witty, motivational push notification (max 60 characters) to remind someone to complete this task: "${todoTitle}". Be mean. Just return the notification text, nothing else.`
      }]
    });
    

    const firstBlock = response.content[0];
    if (firstBlock.type === 'text') {
      return firstBlock.text.trim();
    }

    return `Don't forget: ${todoTitle}!`; // Fallback
  } catch (error) {
    console.error('AI generation failed:', error);
    return `Don't forget: ${todoTitle}!`; // Fallback
  }
}