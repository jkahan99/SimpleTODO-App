// Cloudflare Worker for Get It Done notification generation.
// Provider: OpenAI GPT-4o-mini. Deploy with `wrangler deploy`.
// Expects POST { todoTitle, personality } and returns { message }.

const SHARED_FORMAT =
  'Output ONLY the raw notification text with no quotes, no parentheses, ' +
  'no brackets, no prefixes, no explanations. Maximum 60 characters.';

const PERSONALITIES = {
  friendly: {
    system:
      'You are a notification text generator with a warm, encouraging personality. ' +
      SHARED_FORMAT,
    instruction: (todoTitle) =>
      `Write a warm, encouraging, supportive push notification reminding someone to do this task: ${todoTitle}`,
  },
  funny: {
    system:
      'You are a notification text generator with an absurdist sense of humor. ' +
      'Use unexpected comparisons and playful nonsense. ' +
      SHARED_FORMAT,
    instruction: (todoTitle) =>
      `Write a funny, absurdist push notification with an unexpected comparison reminding someone to do this task: ${todoTitle}`,
  },
  mean: {
    system:
      'You are a notification generator that roasts the user for procrastinating. ' +
      'Be sarcastic, blunt, and a little savage about the fact that they STILL ' +
      "haven't done this. Mock their procrastination directly. Keep it under 60 " +
      'chars, no quotes/brackets/prefixes.',
    instruction: (todoTitle) =>
      `Roast this person hard for still not having done this task. Be sarcastic and call out their laziness directly: ${todoTitle}`,
  },
  hype: {
    system:
      'You are a notification text generator with over-the-top hypeman energy. ' +
      'Maximum enthusiasm, like an excited coach pumping someone up. ' +
      SHARED_FORMAT,
    instruction: (todoTitle) =>
      `Write an over-the-top, high-energy hypeman push notification pumping someone up to do this task: ${todoTitle}`,
  },
};

const DEFAULT_PERSONALITY = 'funny';

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const { todoTitle, personality } = await request.json();

      if (!todoTitle) {
        return new Response(JSON.stringify({ message: 'Missing todoTitle' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const persona = PERSONALITIES[personality] || PERSONALITIES[DEFAULT_PERSONALITY];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 100,
          messages: [
            {
              role: 'system',
              content: persona.system
            },
            {
              role: 'user',
              content: persona.instruction(todoTitle)
            }
          ]
        })
      });

      const data = await response.json();
      const messageText = data.choices?.[0]?.message?.content;

      if (messageText) {
        const cleaned = messageText.trim().replace(/^["'(\[]+|["')\]]+$/g, '').trim();
        return new Response(JSON.stringify({ message: cleaned }), {
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify({ message: `Don't forget: ${todoTitle}!` }), {
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ message: `Don't forget your task!` }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
}
