exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { image } = JSON.parse(event.body);

    if (!image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No image provided' }),
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert Arabic language teacher. Extract ALL Arabic vocabulary words and their English translations from this image.

CRITICAL: Include ALL harakats/tashkeel (diacritical marks) on the Arabic text exactly as shown:
- Fatha (فَتْحَة) - the small line above: َ
- Kasra (كَسْرَة) - the small line below: ِ
- Damma (ضَمَّة) - the small و above: ُ
- Sukun (سُكُون) - the small circle: ْ
- Shadda (شَدَّة) - the small ّ for doubling
- Tanween (تَنْوِين) - ً ٍ ٌ

Return the data as a JSON array with objects containing "arabic" and "english" fields.
Only return the JSON array, no other text.

Example format with proper harakats:
[{"arabic": "كِتَابٌ", "english": "book"}, {"arabic": "قَلَمٌ", "english": "pen"}]

If there are masculine/feminine forms shown (like أَصْفَرُ - صَفْرَاءُ), include BOTH forms in the arabic field separated by " - ".

If there are singular/plural forms, include them the same way.

Extract EVERY vocabulary pair you can see. Be thorough and precise with the harakats.`,
              },
              {
                type: 'image_url',
                image_url: { url: image },
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to process image' }),
      };
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Could not parse vocabulary from image' }),
      };
    }

    const vocabulary = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ vocabulary }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
