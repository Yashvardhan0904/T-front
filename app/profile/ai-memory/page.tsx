'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Brain,
    X,
    Settings,
    Bell,
    UserCircle,
    Shield,
    Database,
    ChevronDown,
    Save,
    History,
    MessageSquare,
    Sparkles,
    Check,
    RefreshCcw,
    User,
    Bot
} from 'lucide-react';

export default function AIMemoryPage() {
    const { user: authUser, loading: authLoading, isAuthenticated } = useAuth() as any;
    const [memory, setMemory] = useState<any>(null);
    const [contexts, setContexts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('Personalization');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    // Personalization State
    const [personalization, setPersonalization] = useState({
        userName: '',
        tone: 'Default',
        warmth: 'Default',
        enthusiasm: 'Default',
        formatting: 'Default',
        emoji: 'Default',
        customInstructions: ''
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/profile/ai-memory');
        } else if (isAuthenticated) {
            fetchAIData();
        }
    }, [authLoading, isAuthenticated, router]);

    const fetchAIData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/ai/memory');
            const data = await res.json();
            if (data.success) {
                setMemory(data.memory);
                setContexts(data.context || []);
                const p = data.memory?.personalization || {};
                setPersonalization({
                    userName: data.memory?.userName || '',
                    tone: p.tone || 'Default',
                    warmth: p.warmth || 'Default',
                    enthusiasm: p.enthusiasm || 'Default',
                    formatting: p.formatting || 'Default',
                    emoji: p.emoji || 'Default',
                    customInstructions: p.customInstructions || ''
                });
            }
        } catch (error) {
            console.error('Error fetching AI data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/ai/memory', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: personalization.userName,
                    personalization: {
                        tone: personalization.tone,
                        warmth: personalization.warmth,
                        enthusiasm: personalization.enthusiasm,
                        formatting: personalization.formatting,
                        emoji: personalization.emoji,
                        customInstructions: personalization.customInstructions
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ text: 'Settings saved', type: 'success' });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            setMessage({ text: 'Failed to save', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Brain size={40} className="text-amber-500 animate-pulse" />
            </div>
        );
    }

    const tabs = [
        { name: 'General', icon: Settings },
        { name: 'Personalization', icon: UserCircle },
        { name: 'Data controls', icon: Shield },
        { name: 'Security', icon: Shield },
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <Brain className="text-amber-500" />
                        AI Identity
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1 uppercase tracking-widest font-bold">Personalization & Context History</p>
                </div>
                {message && (
                    <div className={`px-4 py-2 rounded-full text-xs font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Settings Navigation - Horizontal scroll on mobile */}
                <aside className="lg:col-span-3">
                    <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex items-center gap-2 lg:gap-3 px-4 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.name
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                    : 'text-muted-foreground bg-muted/10 lg:bg-transparent hover:bg-muted/50 hover:text-foreground'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.name}
                            </button>
                        ))}
                    </nav>

                    <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">DNA Verified</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <Bot size={14} className="text-amber-500" /> Style Inferred: {memory?.style?.fit || 'Scanning...'}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <Bot size={14} className="text-amber-500" /> Vibe: {memory?.style?.vibe || 'Learning...'}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right: Dynamic Content Area */}
                <main className="lg:col-span-9 space-y-8">

                    {activeTab === 'Personalization' ? (
                        <div className="space-y-8">

                            {/* Chat Transcript Context - The "Meat" */}
                            <section className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <History size={16} className="text-amber-500" />
                                        Context History (Interaction Turns)
                                    </h3>
                                    <span className="text-[10px] text-muted-foreground font-mono">Live Sync</span>
                                </div>
                                <div className="p-0 max-h-[400px] overflow-y-auto divide-y divide-border">
                                    {contexts.length > 0 ? (
                                        contexts.map((ctx, idx) => (
                                            <div key={idx} className="p-6 space-y-4 hover:bg-muted/10 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(ctx.createdAt).toLocaleString()}</span>
                                                    <div className="flex gap-2">
                                                        {ctx.intentHistory?.map((it: any, i: number) => (
                                                            <span key={i} className="px-2 py-0.5 bg-amber-500/5 text-amber-500 text-[10px] rounded font-black uppercase">{it.primary_action}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    {ctx.conversationHistory?.slice(-2).map((msg: any, mIdx: number) => (
                                                        <div key={mIdx} className="flex gap-3">
                                                            <div className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-muted' : 'bg-amber-500 shadow-sm'}`}>
                                                                {msg.role === 'user' ? <User size={12} className="text-muted-foreground" /> : <Bot size={12} className="text-white" />}
                                                            </div>
                                                            <div className="flex-1 text-sm bg-muted/30 p-3 rounded-2xl rounded-tl-none border border-border/50">
                                                                <p className="line-clamp-2 italic text-muted-foreground">"{msg.content}"</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-muted-foreground italic text-sm">
                                            No conversational patterns analyzed yet.
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Settings Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                <section className="bg-card rounded-3xl border border-border p-8 space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest">Base Identity</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground">Nickname</label>
                                            <input
                                                type="text"
                                                value={personalization.userName}
                                                onChange={(e) => setPersonalization({ ...personalization, userName: e.target.value })}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                                placeholder="e.g. Yash"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground">Tone of Voice</label>
                                            <div className="relative">
                                                <select
                                                    value={personalization.tone}
                                                    onChange={(e) => setPersonalization({ ...personalization, tone: e.target.value })}
                                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none"
                                                >
                                                    <option>Default</option>
                                                    <option>Playful</option>
                                                    <option>Strictly Professional</option>
                                                    <option>Minimalist</option>
                                                </select>
                                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-card rounded-3xl border border-border p-8 space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest">Advanced Personality</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Warmth', state: 'warmth' },
                                            { label: 'Enthusiasm', state: 'enthusiasm' },
                                            { label: 'Emoji Usage', state: 'emoji' },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{item.label}</span>
                                                <div className="relative min-w-[120px]">
                                                    <select
                                                        value={(personalization as any)[item.state]}
                                                        onChange={(e) => setPersonalization({ ...personalization, [item.state]: e.target.value })}
                                                        className="w-full bg-muted/30 border border-border rounded-xl px-3 py-1.5 text-xs appearance-none focus:outline-none"
                                                    >
                                                        <option>Default</option>
                                                        <option>Enhanced</option>
                                                        <option>Reduced</option>
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Custom Instructions */}
                            <section className="bg-card rounded-3xl border border-border p-8 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={18} className="text-amber-500" />
                                    <h3 className="text-sm font-black uppercase tracking-widest">Custom Instructions</h3>
                                </div>
                                <textarea
                                    value={personalization.customInstructions}
                                    onChange={(e) => setPersonalization({ ...personalization, customInstructions: e.target.value })}
                                    placeholder="Enter specific instructions for how the AI should help you shop..."
                                    className="w-full bg-muted/30 border border-border rounded-2xl p-6 text-sm min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                />
                                <div className="flex justify-end pt-4 border-t border-border/50">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-foreground text-background px-8 py-3 rounded-xl text-sm font-black hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <RefreshCcw size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
                                    </button>
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="h-[60vh] bg-muted/10 border border-border border-dashed rounded-[3rem] flex flex-col items-center justify-center text-muted-foreground">
                            <Shield size={48} className="opacity-10 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">Syncing with MongoDB Atlas</p>
                            <p className="text-xs mt-2 italic opacity-50">Enterprise security layer active.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
