import { callGemini } from './geminiClient.js';
import { parseJSONSafe } from './aiResponseParser.js';

export class AIResponseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AIResponseError';
    }
}

export async function callGeminiWithRetry(prompt, retries = 3) {
    for (let i = 0; i < retries; i++) {
        const raw = await callGemini(prompt);
        const json = parseJSONSafe(raw);

        if (json) {
            return json;
        }
    }

    throw new AIResponseError('AI did not return valid JSON after retries');
}
