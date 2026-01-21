/**
 * Bridge for AI functionalities.
 * Delegating to Trendora Python server for embeddings.
 */

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await fetch(`${process.env.TRENDORA_SERVER_URL}/api/embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            console.error('Trendora Embedding Error:', await response.text());
            return [];
        }

        const data = await response.json();
        return data.embedding || [];
    } catch (error) {
        console.error('Failed to generate embedding via Trendora:', error);
        return [];
    }
}

export async function callLLM(prompt: string): Promise<string> {
    console.warn('callLLM called in Next.js. This is deprecated. Use Trendora backend instead.');
    return "This is a mock response. Please use the Trendora backend.";
}
