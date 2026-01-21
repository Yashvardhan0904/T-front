'use client';

interface ChatBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    model?: string;
    toolUsed?: string;
    isLoading?: boolean;
}

export function ChatBubble({ role, content, model, toolUsed, isLoading }: ChatBubbleProps) {
    const isUser = role === 'user';

    if (isLoading) {
        return (
            <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%]">
                <div
                    className={`
                        rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm
                        ${isUser
                            ? 'bg-amber-500 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                        }
                    `}
                >
                    {content}
                </div>

                {!isUser && (model || toolUsed) && (
                    <div className="flex gap-2 mt-1.5 ml-1">
                        {model && (
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                {model}
                            </span>
                        )}
                        {toolUsed && (
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                {toolUsed}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
