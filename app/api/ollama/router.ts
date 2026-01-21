export interface IntentObject {
    primary_action: 'product_search' | 'cart_view' | 'coupon_inquiry' | 'general_chat';
    certainty: number; // 0.0 to 1.0 (Scoring applies mainly to product_search)
    category: string | null;
    use_case: string | null;
    budget: { min: number; max: number } | null;
    fit: string | null;
    userName: string | null; // Extracted name if they introduce themselves
    urgency: 'low' | 'high' | null;
    missing_info: string[];
}

const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11434/api/chat';

/**
 * PHASE 1: Pre-LLM Keyword Detection (Fast Path)
 * Detects obvious intents before calling LLM to save time and improve accuracy
 */
function detectExplicitIntent(message: string, history: any[] = []): IntentObject | null {
    const lowerMessage = message.toLowerCase().trim();

    // PRODUCT SEARCH KEYWORDS (High Priority)
    const productSearchKeywords = [
        'want', 'need', 'looking for', 'find me', 'show me', 'suggest',
        'recommend', 'search for', 'get me', 'i need', 'i want',
        'looking to buy', 'shopping for', 'buy'
    ];

    // PRODUCT CATEGORIES
    const productCategories = [
        'hoodie', 'jogger', 'jeans', 'shirt', 't-shirt', 'tshirt',
        'jacket', 'sweater', 'pants', 'shorts', 'sneakers', 'shoes',
        'dress', 'skirt', 'blazer', 'coat', 'sweatshirt', 'trackpants'
    ];

    // CART KEYWORDS (Very Specific)
    const cartKeywords = [
        'show cart', 'view cart', 'my cart', 'cart items', 'what\'s in cart',
        'checkout', 'proceed to checkout', 'check out', 'see cart'
    ];

    // COUPON KEYWORDS
    const couponKeywords = [
        'discount', 'coupon', 'promo', 'promo code', 'offer', 'deal',
        'sale', 'voucher'
    ];

    // GREETING KEYWORDS
    const greetingKeywords = [
        'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
        'sup', 'yo', 'greetings'
    ];

    // Check for explicit cart intent
    const hasCartKeyword = cartKeywords.some(keyword => lowerMessage.includes(keyword));
    if (hasCartKeyword) {
        // console.log('[Intent] Fast Path: Detected cart_view via keyword');
        return {
            primary_action: 'cart_view',
            certainty: 1.0,
            category: null,
            use_case: null,
            budget: null,
            fit: null,
            userName: null,
            urgency: null,
            missing_info: []
        };
    }

    // Check for coupon intent
    const hasCouponKeyword = couponKeywords.some(keyword => lowerMessage.includes(keyword));
    if (hasCouponKeyword) {
        // console.log('[Intent] Fast Path: Detected coupon_inquiry via keyword');
        return {
            primary_action: 'coupon_inquiry',
            certainty: 1.0,
            category: null,
            use_case: null,
            budget: null,
            fit: null,
            userName: null,
            urgency: null,
            missing_info: []
        };
    }

    // Check for product search (keyword + category)
    const hasProductKeyword = productSearchKeywords.some(keyword => lowerMessage.includes(keyword));
    const detectedCategory = productCategories.find(cat => lowerMessage.includes(cat));

    if (hasProductKeyword || detectedCategory) {
        // console.log('[Intent] Fast Path: Detected product_search via keywords');

        // Extract fit if present
        const fitKeywords = ['oversized', 'slim', 'regular', 'tight', 'loose', 'fitted', 'relaxed'];
        const detectedFit = fitKeywords.find(fit => lowerMessage.includes(fit));

        // Extract use case
        const useCases = ['party', 'gym', 'casual', 'formal', 'work', 'office', 'workout', 'running'];
        const detectedUseCase = useCases.find(uc => lowerMessage.includes(uc));

        // Calculate certainty based on completeness
        let certainty = 0.7; // Base certainty for keyword match
        if (detectedCategory) certainty += 0.1;
        if (detectedFit) certainty += 0.1;
        if (detectedUseCase) certainty += 0.1;

        const missing: string[] = [];
        if (!detectedCategory) missing.push('category');
        if (!detectedFit) missing.push('fit');
        if (!detectedUseCase) missing.push('use_case');

        return {
            primary_action: 'product_search',
            certainty: Math.min(certainty, 1.0),
            category: detectedCategory || null,
            use_case: detectedUseCase || null,
            budget: null,
            fit: detectedFit || null,
            userName: null,
            urgency: null,
            missing_info: missing
        };
    }

    // Check for greetings
    const isGreeting = greetingKeywords.some(keyword =>
        lowerMessage === keyword || lowerMessage.startsWith(keyword + ' ') || lowerMessage.endsWith(' ' + keyword)
    );
    if (isGreeting && lowerMessage.length < 20) {
        // console.log('[Intent] Fast Path: Detected general_chat (greeting)');
        return {
            primary_action: 'general_chat',
            certainty: 1.0,
            category: null,
            use_case: null,
            budget: null,
            fit: null,
            userName: null,
            urgency: null,
            missing_info: []
        };
    }

    // No explicit intent detected, proceed to LLM
    return null;
}

/**
 * PHASE 2: LLM-Based Intent Analysis (with Context)
 */
export async function analyzeIntent(message: string, history: any[] = []): Promise<IntentObject> {
    try {
        // PHASE 1: Try fast path first
        const explicitIntent = detectExplicitIntent(message, history);
        if (explicitIntent) {
            return explicitIntent;
        }

        // console.log('[Intent] Fast Path failed, using LLM analysis...');

        // Build conversation context
        const recentHistory = history.slice(-3)
            .map((m: any) => `${m.role}: ${m.content}`)
            .join('\n');

        const systemPrompt = `
        You are the INTENT DISCOVERY ENGINE for a shopping agent.
        Your goal is to extract structured shopping intent from the USER_MESSAGE.
        
        CONVERSATION CONTEXT (Recent messages):
        ${recentHistory || 'No previous context'}
        
        REQUIRED OUTPUT FORMAT (JSON ONLY):
        {
          "primary_action": "product_search" | "cart_view" | "coupon_inquiry" | "general_chat",
          "certainty": number, // 0.0 - 1.0. For product_search, score based on completeness. For others, set to 1.0.
          "category": string | null, // e.g. "hoodie", "sneakers", "jogger"
          "use_case": string | null, // e.g. "party", "gym"
          "budget": { "min": number, "max": number } | null,
          "fit": string | null, // e.g. "oversized", "slim"
          "userName": string | null, // EXTRACT name if user says "I am [name]" or "my name is [name]"
          "urgency": "low" | "high" | null,
          "missing_info": string[] // ["category", "budget", "use_case"]
        }

        CRITICAL RULES:
        1. If user mentions a PRODUCT NAME or CATEGORY (hoodie, jogger, shoes, etc.) → ALWAYS use "primary_action": "product_search"
        2. If user uses words like "want", "need", "looking for", "find" → ALWAYS "primary_action": "product_search"
        3. Only use "cart_view" if explicitly mentioning "cart", "checkout", or "my cart"
        4. Only use "general_chat" for greetings, personal questions, or chitchat
        5. For "product_search": Score certainty based on:
           - Has category: +0.5
           - Has fit/style: +0.2
           - Has use_case: +0.2
           - Has budget: +0.1

        EXAMPLES:
        - "I want an oversized jogger" → product_search (certainty: 0.9)
        - "show me hoodies" → product_search (certainty: 0.7)
        - "what's in my cart" → cart_view (certainty: 1.0)
        - "hi" → general_chat (certainty: 1.0)
        
        USER_MESSAGE: "${message}"
        `;

        const res = await fetch(OLLAMA_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen:4b',
                messages: [
                    { role: 'system', content: systemPrompt }
                ],
                stream: false,
                format: 'json',
                options: { temperature: 0 } // Rigid analysis
            }),
        });

        if (!res.ok) throw new Error(`Ollama Intent Error: ${res.status}`);

        const data = await res.json();
        const content = data.message?.content || data.response;

        try {
            const parsed = JSON.parse(content);

            // PHASE 3: Validation Layer
            const validated = validateIntent(parsed, message);

            // console.log('[Intent] LLM Result:', validated);
            return validated;

        } catch (e) {
            console.error('[Intent] JSON Parse Failed:', content);
            return fallbackIntent(message);
        }

    } catch (error) {
        console.error('[Intent] Analysis Failed:', error);
        return fallbackIntent(message);
    }
}

/**
 * PHASE 3: Intent Validation
 * Prevents misclassification by validating LLM output against rules
 */
function validateIntent(parsed: any, originalMessage: string): IntentObject {
    const lowerMessage = originalMessage.toLowerCase();

    // Rule 1: If message contains product category but classified as cart_view → override to product_search
    const productCategories = [
        'hoodie', 'jogger', 'jeans', 'shirt', 't-shirt', 'tshirt',
        'jacket', 'sweater', 'pants', 'shorts', 'sneakers', 'shoes'
    ];

    const hasProductCategory = productCategories.some(cat => lowerMessage.includes(cat));
    const hasCartKeyword = ['show cart', 'my cart', 'view cart', 'checkout'].some(k => lowerMessage.includes(k));

    if (hasProductCategory && !hasCartKeyword && parsed.primary_action === 'cart_view') {
        console.warn('[Intent] Validation: Overriding cart_view to product_search (category detected)');
        parsed.primary_action = 'product_search';
        parsed.certainty = 0.8;
    }

    // Rule 2: If message has product intent words → force product_search
    const productIntentWords = ['want', 'need', 'looking for', 'find me', 'show me', 'suggest', 'recommend'];
    const hasProductIntent = productIntentWords.some(word => lowerMessage.includes(word));

    if (hasProductIntent && hasProductCategory && parsed.primary_action !== 'product_search') {
        console.warn('[Intent] Validation: Forcing product_search (intent words + category)');
        parsed.primary_action = 'product_search';
        parsed.certainty = 0.9;
    }

    // Rule 3: Extract category if not detected
    if (parsed.primary_action === 'product_search' && !parsed.category) {
        const detectedCategory = productCategories.find(cat => lowerMessage.includes(cat));
        if (detectedCategory) {
            parsed.category = detectedCategory;
            // console.log('[Intent] Validation: Extracted category:', detectedCategory);
        }
    }

    // Rule 4: Extract fit if not detected
    if (parsed.primary_action === 'product_search' && !parsed.fit) {
        const fitKeywords = ['oversized', 'slim', 'regular', 'tight', 'loose', 'fitted', 'relaxed'];
        const detectedFit = fitKeywords.find(fit => lowerMessage.includes(fit));
        if (detectedFit) {
            parsed.fit = detectedFit;
            // console.log('[Intent] Validation: Extracted fit:', detectedFit);
        }
    }

    // Build proper IntentObject
    return {
        primary_action: parsed.primary_action || 'product_search',
        certainty: parsed.certainty || 0,
        category: parsed.category || null,
        use_case: parsed.use_case || null,
        budget: parsed.budget || null,
        fit: parsed.fit || parsed.style || null,
        userName: parsed.userName || null,
        urgency: parsed.urgency || null,
        missing_info: parsed.missing_info || []
    };
}

function fallbackIntent(message?: string): IntentObject {
    // If we have a message, try basic keyword matching as last resort
    if (message) {
        const lowerMessage = message.toLowerCase();
        const productCategories = ['hoodie', 'jogger', 'jeans', 'shirt', 'shoes', 'pants'];
        const hasCategory = productCategories.some(cat => lowerMessage.includes(cat));

        if (hasCategory) {
            return {
                primary_action: 'product_search',
                certainty: 0.5,
                category: productCategories.find(cat => lowerMessage.includes(cat)) || null,
                use_case: null,
                budget: null,
                fit: null,
                userName: null,
                urgency: null,
                missing_info: ['use_case', 'fit']
            };
        }
    }

    return {
        primary_action: 'general_chat',
        certainty: 0.0,
        category: null,
        use_case: null,
        budget: null,
        fit: null,
        userName: null,
        urgency: null,
        missing_info: ['category']
    };
}

export async function generateQuestion(intent: IntentObject): Promise<string> {
    const missing = intent.missing_info.join(', ');
    const systemPrompt = `
    You are the QUESTION GENERATOR for a senior shopping agent.
    The user's intent is unclear (Certainty: ${intent.certainty}).
    
    MISSING INFO: ${missing}
    CURRENT KNOWLEDGE: 
    - Category: ${intent.category || 'Unknown'}
    - Use Case: ${intent.use_case || 'Unknown'}
    - Budget: ${intent.budget ? 'Known' : 'Unknown'}

    GOAL: Ask ONE conversational question to fill the most important missing gap.
    PRIORITY:
    1. Category (If unknown, ask this first!)
    2. Use Case (Where will they wear it?)
    3. Budget (Price range?)
    4. Fit/Vibe

    RULES:
    - Keep it short (1 sentence).
    - Be friendly but professional.
    - Example: "Could you tell me what kind of occasion this is for?"
    `;

    try {
        const res = await fetch(OLLAMA_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen:4b',
                messages: [
                    { role: 'system', content: systemPrompt }
                ],
                stream: false,
                options: { temperature: 0.7 }
            }),
        });

        const data = await res.json();
        return data.message?.content || "Could you tell me a bit more about what you're looking for?";
    } catch (e) {
        return "Could you give me more details about what you need?";
    }
}
