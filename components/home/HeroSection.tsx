import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection({ productCount }: { productCount?: number }) {
    return (
        <section className="relative w-full overflow-hidden bg-white dark:bg-[#0a0a0c] transition-colors duration-300">

            {/* Background Gradients - Light & Dark optimized */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-900/10 dark:to-transparent pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-amber-100/40 dark:bg-amber-500/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-32 flex flex-col items-center justify-center text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-amber-100 dark:border-white/10 shadow-sm mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">New AI Collection Available</span>
                </div>

                {/* Hero Title */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 dark:text-white mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                    WEAR THE <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600">
                        FUTURE.
                    </span>
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    Experience the next evolution of fashion.
                    AI-curated styles tailored exclusively to your unique taste.
                    {productCount ? ` Join others exploring ${productCount}+ innovative items.` : ''}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                    <Link
                        href="/chat"
                        className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-xl shadow-amber-900/10 dark:shadow-none"
                    >
                        Start Styling
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/products"
                        className="w-full sm:w-auto px-8 py-4 text-gray-700 dark:text-gray-300 font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                        Browse Collection
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="mt-20 md:mt-32 w-full max-w-4xl grid grid-cols-3 gap-8 md:gap-12 border-t border-gray-200 dark:border-white/10 pt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                    <div>
                        <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">01</p>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest">Identify</p>
                    </div>
                    <div>
                        <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">02</p>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest">Curate</p>
                    </div>
                    <div>
                        <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">03</p>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest">Wear</p>
                    </div>
                </div>

            </div>
        </section>
    );
}
