import { Sparkles } from 'lucide-react';

export default function ChatLoader() {
    return (
        <div className="flex items-center gap-2 p-4 max-w-fit">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
                <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping-slow"></div>
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                    Trendora is thinking...
                </span>
                <span className="text-[10px] text-gray-400">
                    Finding the best matches for you
                </span>
            </div>
        </div>
    );
}
