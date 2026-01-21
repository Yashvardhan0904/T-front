'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/cart-store';
import {
    ShoppingBag,
    ArrowRight,
    Brain,
    Sparkles,
    Plus,
    Paperclip,
    Heart,
    Check,
    Mic,
    Globe
} from 'lucide-react';
import ChatTypewriter from '@/components/chat/ChatTypewriter';
import ChatLoader from '@/components/chat/ChatLoader';
import { useToast } from '@/context/ToastContext';

interface Product {
    _id: string; // Changed from name to handle MongoDB ID
    name: string;
    price: number;
    brand: string;
    category?: string;
    color?: string;
    formality?: number;
    images?: string[];
    aiReason?: string;
    aiScore?: number;
}

interface Outfit {
    outfit_id: string;
    items: Product[];
    total_price: number;
    score: number;
    selection_type: string;
    insights: string[];
    warnings: string[];
    component_scores: Record<string, number>;
}

interface Intent {
    category: string | null;
    use_case: string | null;
    budget: { min: number; max: number } | null;
    fit: string | null;
    certainty: number;
    primary_action: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    products?: Product[];
    outfits?: Outfit[]; // New
    metadata?: any; // New
    loading?: boolean;
    intent?: Intent;
    memoryUsed?: boolean;
    isTyping?: boolean;
}

function ProductLikeButton({ productId }: { productId: string }) {
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth() as any;
    const { showToast } = useToast();

    useEffect(() => {
        if (!productId) return;
        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/products/like?productId=${productId}`);
                if (res.ok) {
                    const data = await res.json();
                    setLiked(data.liked);
                }
            } catch (error) {
                console.error('Error checking like status:', error);
            }
        };
        checkStatus();
    }, [productId]);

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            showToast('Please sign in to manage your likes', 'info');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/products/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });
            if (res.ok) {
                const data = await res.json();
                setLiked(data.liked);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={loading}
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all z-10 ${liked
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-2 ring-white/50'
                : 'bg-white/40 text-gray-800 hover:bg-white/60'
                }`}
        >
            <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
        </button>
    );
}

function OutfitCard({ outfit }: { outfit: Outfit }) {
    const isExploration = outfit.selection_type !== 'safe';
    const addItem = useCartStore((state) => state.addItem);
    const { showToast } = useToast();
    const [added, setAdded] = useState(false);

    const handleBuyLook = async () => {
        try {
            outfit.items.forEach(item => {
                addItem({
                    id: item._id,
                    name: item.name,
                    price: item.price,
                    image: item.images?.[0],
                    quantity: 1,
                    color: item.color,
                    size: 'M' // Default size
                });
            });
            setAdded(true);
            showToast('Outfit successfully added to your bag', 'success');
            setTimeout(() => setAdded(false), 2000);
        } catch (err) {
            showToast('Could not add outfit to bag. Please try again.', 'error');
        }
    };

    return (
        <div className={`mb-6 p-4 rounded-2xl border ${isExploration
            ? 'bg-gradient-to-br from-purple-50 to-amber-50 dark:from-purple-900/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-700/50'
            : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10'
            } shadow-sm overflow-hidden`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isExploration ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                        }`}>
                        {outfit.selection_type === 'wildcard' ? '✨ Experimental' :
                            outfit.selection_type === 'adjacent' ? '🔄 Style Switch' : '✅ Best Fit'}
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                        ₹{outfit.total_price.toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {(outfit.score * 100).toFixed(0)}% Harmony
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {outfit.items.map((item, idx) => (
                    <div key={idx} className="relative group">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-white/5">
                            <img
                                src={item.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200'}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <ProductLikeButton productId={item._id} />
                        </div>
                        <div className="mt-1">
                            <p className="text-[10px] font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                            <p className="text-[9px] text-gray-500 uppercase">{item.category}</p>
                        </div>
                    </div>
                ))}
            </div>

            {outfit.insights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {outfit.insights.slice(0, 3).map((insight, idx) => (
                        <div key={idx} className="px-2 py-0.5 bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-md text-[9px] text-gray-600 dark:text-gray-400 italic">
                            {insight}
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleBuyLook}
                disabled={added}
                className={`w-full mt-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${added
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90'
                    }`}
            >
                {added ? (
                    <>
                        Added to Cart
                        <Check className="w-3 h-3" />
                    </>
                ) : (
                    <>
                        Buy Look
                        <ShoppingBag className="w-3 h-3" />
                    </>
                )}
            </button>
        </div>
    );
}

function IntentCard({ intent, memoryUsed }: { intent: Intent; memoryUsed?: boolean }) {
    if (!intent || intent.certainty < 0.7) return null;
    if (intent.primary_action !== 'product_search') return null;

    const fmt = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div className="mb-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 border border-blue-200 dark:border-blue-700/50 rounded-full shadow-sm">
                <Brain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-100">
                    Looking for {intent.fit ? fmt(intent.fit) + ' ' : ''}{intent.category ? fmt(intent.category) : 'Items'}
                    {intent.use_case ? ` • ${fmt(intent.use_case)}` : ''}
                </span>
            </div>

            {memoryUsed && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/50 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="text-[11px] font-medium text-purple-700 dark:text-purple-200">
                        Style Adapted
                    </span>
                </div>
            )}
        </div>
    );
}

function ProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((state) => state.addItem);
    const { showToast } = useToast();
    const [added, setAdded] = useState(false);

    const handleAddToCart = async () => {
        try {
            addItem({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.images?.[0],
                quantity: 1,
                color: product.color,
                size: 'M' // Default size
            });
            setAdded(true);
            showToast('Item successfully added to your bag', 'success');
            setTimeout(() => setAdded(false), 2000);
        } catch (err) {
            showToast('Could not add item to bag. Please try again.', 'error');
        }
    };

    return (
        <div className="bg-white dark:bg-[#16181d] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1">
            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative">
                <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">
                    {((product.aiScore || 0.85) * 100).toFixed(0)}% Match
                </div>
            </div>
            <div className="p-3">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest mb-0.5">{product.brand}</p>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString()}</span>
                    <button
                        onClick={handleAddToCart}
                        disabled={added}
                        className={`text-[10px] px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1 uppercase tracking-tight ${added
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90'
                            }`}
                    >
                        {added ? 'Added' : 'Add'}
                        {added ? <Check className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                    </button>
                </div>
                {product.aiReason && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 italic leading-relaxed">
                            "{product.aiReason}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ChatContent() {
    const { user, login, isAuthenticated } = useAuth() as any;
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const chatId = searchParams.get('id');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(chatId);
    const [isMounted, setIsMounted] = useState(false);

    // Default welcome message
    const defaultWelcome: Message = {
        role: 'assistant',
        content: "Hello! I'm your Trendora AI Assistant. I can help you find the best products based on your style.",
    };

    const [messages, setMessages] = useState<Message[]>([defaultWelcome]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Quick suggestions for better UX
    const quickSuggestions = [
        "✨ Trending Now",
        "👔 Professional Outfits",
        "👟 Casual Weekend Look",
        "🎁 Gift Ideas",
        "🔥 Best of Winter"
    ];

    useEffect(() => {
        if (user?.id || user?._id) {
            setUserId(user.id || user._id);
        } else {
            let storedId = sessionStorage.getItem('antigravity_userId');
            if (!storedId) {
                storedId = 'guest-' + Date.now();
                sessionStorage.setItem('antigravity_userId', storedId);
            }
            setUserId(storedId);
        }
    }, [user]);

    useEffect(() => {
        const loadChat = async () => {
            if (chatId && user === undefined) {
                return;
            }

            if (chatId === currentChatId && messages.length > 1) {
                return;
            }

            if (chatId && user) {
                setCurrentChatId(chatId);
                setMessages([]);
                await fetchHistory(chatId);
            } else if (!chatId) {
                setMessages([defaultWelcome]);
                setCurrentChatId(null);
            }
        };

        loadChat();
    }, [chatId, user]);

    async function fetchHistory(id: string) {
        try {
            setLoading(true);
            const res = await fetch(`/api/ollama/history?chatId=${id}`, {
                headers: {
                    'x-user-id': userId || ''
                }
            });
            const data = await res.json();
            if (data.success) {
                if (data.messages.length > 0) {
                    setMessages(data.messages.map((m: any) => ({
                        role: m.role,
                        content: m.content,
                        products: (m.toolResult && m.toolResult.topPicks) ? m.toolResult.topPicks : m.products || [],
                        intent: m.intent,
                        memoryUsed: m.memoryUsed
                    })));
                } else {
                    setMessages([defaultWelcome]);
                }
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            setMessages([{
                role: 'assistant',
                content: "Error loading conversation history.",
            }]);
        } finally {
            setLoading(false);
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    async function handleSend() {
        if (!input.trim() || !userId) return;

        const userGoal = input;
        setInput('');
        setLoading(true);

        const newUserMessage: Message = { role: 'user', content: userGoal };
        setMessages(prev => [...prev, newUserMessage]);

        try {
            const res = await fetch('/api/ollama', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userGoal,
                    userId: userId,
                    chatId: currentChatId,
                    history: messages.slice(-5)
                }),
            });

            const data = await res.json();

            if (data.success) {
                if (data.chatId && !currentChatId) {
                    setCurrentChatId(data.chatId);
                    router.replace(`/chat?id=${data.chatId}`, { scroll: false });
                }

                let products = [];
                if (data.toolUsed === 'antigravity_run' && data.toolResult?.topPicks) {
                    products = data.toolResult.topPicks;
                }

                // Add skeleton assistant message that will be "typed" out
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.response, // Store full content for the typewriter
                    products: products.length > 0 ? products : undefined,
                    outfits: data.outfits && data.outfits.length > 0 ? data.outfits : undefined,
                    metadata: data.metadata,
                    intent: data.intent,
                    memoryUsed: !!data.memory,
                    isTyping: true // Mark as typing to trigger the typewriter component
                }]);

                setLoading(false);

            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "Sorry, I encountered an error. The system might be under high load or disconnected.",
                }]);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Network error. Please check your connection.",
            }]);
            setLoading(false);
        }
    }

    const handleFileUpload = () => {
        showToast("Enhanced feature coming soon!", "info");
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0a0a0c] font-sans">
            {/* Header */}
            <div className="bg-white/80 dark:bg-black/60 border-b border-gray-200 dark:border-white/5 py-2.5 px-3 sm:py-3 sm:px-6 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white text-xs font-bold uppercase text-[10px]">T</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Trendora AI</h1>
                            <p className="text-[10px] text-green-500 flex items-center gap-1 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>

                    {/* Header Actions - Important Only */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push('/cart')}
                            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors relative"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {useCartStore.getState().items.length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-black"></span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-6">
                <div className="max-w-3xl mx-auto space-y-6 pb-4 min-h-full flex flex-col justify-end">

                    {/* Empty State / Welcome Screen - Minimalist Design */}
                    {messages.length <= 1 && !loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-700 slide-in-from-bottom-4 fill-mode-forwards" style={{ opacity: 1 }}>
                            <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <Sparkles className="w-6 h-6 text-gray-900 dark:text-white" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-gray-200 mb-6 sm:mb-8">
                                How can I help you today?
                            </h2>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 w-full max-w-2xl px-2 sm:px-4">
                                {[
                                    { label: "Find a party outfit", sub: "Based on your style" },
                                    { label: "Analyze my style", sub: "From recent purchases" },
                                    { label: "Gift ideas", sub: "For special occasions" },
                                    { label: "What's trending?", sub: "Latest fashion news" }
                                ].map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setInput(item.label)}
                                        className="text-left p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.sub}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages - ChatGPT Style */}
                    {messages.map((msg, idx) => (
                        (messages.length > 1 && idx === 0 && msg.content.startsWith("Hello!")) ? null :
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`max-w-[95%] sm:max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>

                                    {msg.role === 'assistant' && msg.intent && (
                                        <IntentCard intent={msg.intent} memoryUsed={msg.memoryUsed} />
                                    )}

                                    <div className={`text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-[#f4f4f4] dark:bg-[#2f2f2f] px-5 py-3 rounded-3xl text-gray-900 dark:text-white font-medium'
                                        : 'text-gray-800 dark:text-gray-200 px-1 py-1 font-normal'
                                        }`}>
                                        {msg.role === 'assistant' && msg.isTyping ? (
                                            <ChatTypewriter content={msg.content} onComplete={() => { }} />
                                        ) : (
                                            <div className="whitespace-pre-wrap">{msg.content}</div>
                                        )}
                                    </div>

                                    {msg.outfits && msg.outfits.length > 0 && (
                                        <div className="w-full mt-4 space-y-4 pl-1">
                                            {msg.outfits.map((outfit, oIdx) => (
                                                <OutfitCard key={oIdx} outfit={outfit} />
                                            ))}
                                        </div>
                                    )}

                                    {msg.products && (!msg.outfits || msg.outfits.length === 0) && msg.products.length > 0 && (
                                        <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1">
                                            {msg.products.map((p, pIdx) => (
                                                <ProductCard key={pIdx} product={p} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                    ))}

                    {loading && isMounted && <ChatLoader />}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area - Modern Minimal Design */}
            <div className="px-2 py-2 sm:p-4 bg-transparent pb-3 sm:pb-6">
                <div className="max-w-3xl mx-auto">
                    {!loading && messages.length > 5 && (
                        <div className="flex flex-wrap gap-2 mb-3 justify-center animate-in fade-in slide-in-from-bottom-2 px-2">
                            {quickSuggestions.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(s.replace(/^.*? /, ''))}
                                    className="px-4 py-2 bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-transparent rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#424242] transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-[22px] sm:rounded-[26px] flex items-center p-1 sm:p-2 transition-colors focus-within:bg-[#eaeaea] dark:focus-within:bg-[#424242] ring-0 shadow-sm">
                        {/* Left Action - Plus Button */}
                        <button
                            onClick={handleFileUpload}
                            className="p-2 sm:p-2.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-transparent rounded-full ml-0.5 sm:ml-1"
                            aria-label="Add attachment"
                        >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {/* Center Input */}
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask anything"
                            style={{ outline: 'none', boxShadow: 'none' }}
                            className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus:border-0 ring-0 shadow-none text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-2 sm:px-3 h-10 sm:h-12"
                        />

                        {/* Right Actions */}
                        <div className="flex items-center gap-0.5 sm:gap-1 mr-0.5 sm:mr-1">
                            {input.trim() ? (
                                <button
                                    onClick={handleSend}
                                    disabled={loading}
                                    className="p-1.5 sm:p-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-90 transition-all shadow-sm"
                                >
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            ) : (
                                <>
                                    <button className="p-2 sm:p-2.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full">
                                        <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <button className="p-2 sm:p-2.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full">
                                        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 mt-2 sm:mt-3 px-2">
                        Trendora is an AI assistant. All style preferences belong to you. You are free to chat.
                    </p>
                </div>
            </div>
        </div >
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-[#0a0a0c]">
                <ChatLoader />
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
