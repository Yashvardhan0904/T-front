'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ShoppingBag, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ShoppingAgent() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! I\'m your AI Shopping Assistant. I can help you find products, check your budget, and place orders. What are you looking for today?',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);

    const { user } = useAuth();
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        if (user) {
            setUserId(user._id || user.id);
        }
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || !userId) return;

        const userMessage = input;
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/shopping-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    userId,
                    conversationHistory: messages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: data.response },
                ]);

                // Refresh page/cart if action was taken
                if (data.toolCalled && ['add_to_cart', 'checkout', 'remove_from_cart'].includes(data.toolCalled)) {
                    // Optionally trigger a cart refresh event here
                    window.dispatchEvent(new Event('cart-updated'));
                }
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
                ]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Connection error. Please check your internet.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userId) {
        return (
            <div className="p-4 text-center text-gray-500">
                Please log in to use the Shopping Agent.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden font-sans">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h2 className="font-semibold tracking-wide">AI Shopping Assistant</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user'
                                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                : 'bg-indigo-100 text-indigo-600'
                                }`}
                        >
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700 rounded-bl-none'
                                }`}
                        >
                            {msg.content.split('\n').map((line, i) => (
                                <p key={i} className={i > 0 ? 'mt-2' : ''}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-2 text-zinc-400 text-xs ml-12">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for products, check budget..."
                    className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-400 text-sm"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-500/20"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </form>
        </div>
    );
}
