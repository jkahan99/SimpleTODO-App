import { DEFAULT_PERSONALITY, Personality } from './personality';

const WORKER_URL = 'https://simpletodo-ai.jkahan2.workers.dev';

export async function generateWittyNotification(
  todoTitle: string,
  personality: Personality = DEFAULT_PERSONALITY,
): Promise<string> {
  try {
    console.log('Generating notification for:', todoTitle, '(personality:', personality + ')');

    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ todoTitle, personality }),
    });

    if (!response.ok) {
      console.error('HTTP error! status:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const message = data.message;
    
    console.log('AI message for "' + todoTitle + '":', message);
    
    // Check if Claude refused
    const refusalPhrases = [
      "i can't",
      "i'm unable",
      "i cannot",
      "i'd be happy to help you create",
      "instead"
    ];
    
    const isRefusal = refusalPhrases.some(phrase => 
      message.toLowerCase().includes(phrase)
    );
    
    if (isRefusal) {
      console.log('Claude refused, using fallback for:', todoTitle);
      return `Don't forget: ${todoTitle}!`;
    }
    
    console.log('Successfully generated AI notification');
    return message;
    
  } catch (error) {
    console.error('AI generation failed:', error);
    return `Don't forget: ${todoTitle}!`;
  }
}