export async function callGemini(prompt) {
    const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        }
    );

    const raw = await response.text();

    try {
        const parsed = JSON.parse(raw);
        const parts = parsed?.candidates?.[0]?.content?.parts;
        return parts
            ? parts.map(p => p.text || '').join('').replace(/```json|```/g, '').trim()
            : raw;
    } catch {
        return raw;
    }
}
