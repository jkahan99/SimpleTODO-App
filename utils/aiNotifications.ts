const WORKER_URL = 'https://simpletodo-ai.jkahan2.workers.dev';

export async function generateWittyNotification(todoTitle: string): Promise<string> {
  // Basic content filter
  const bannedWords = ['rape', 'kill', 'suicide', 'abuse', 'harm'];
  const lowerTitle = todoTitle.toLowerCase();
  
  if (bannedWords.some(word => lowerTitle.includes(word))) {
    return `Don't forget: ${todoTitle}!`;
  }
  
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ todoTitle }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.message;
    
  } catch (error) {
    console.error('AI generation failed:', error);
    return `Don't forget: ${todoTitle}!`;
  }
}