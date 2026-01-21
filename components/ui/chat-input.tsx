'use client';

import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'Type a message...' }: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() && !disabled) {
            onSend(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-3">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 resize-none disabled:opacity-50 transition-all"
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={disabled || !input.trim()}
                        className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Send
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">
                    Press Enter to send
                </p>
            </div>
        </div>
    );
}
