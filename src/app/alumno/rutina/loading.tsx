import { Calendar, Zap } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-marino pb-32 text-blanco">
            {/* Header Skeleton (Matches real header) */}
            <header className="p-6 pt-12 pb-8 border-b border-marino-4/30 bg-marino/40 backdrop-blur-2xl sticky top-0 z-40">
                <div className="flex items-start justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-naranja/40"></div>
                            <div className="w-32 h-4 rounded-full skeleton-shimmer opacity-40"></div>
                        </div>
                        <div className="w-56 h-10 rounded-xl skeleton-shimmer"></div>
                        <div className="w-24 h-3 rounded-full skeleton-shimmer opacity-30 mt-2"></div>
                    </div>
                    <div className="w-10 h-10 rounded-xl skeleton-shimmer"></div>
                </div>
            </header>

            <main className="p-5 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Microcycle Header Skeleton */}
                <div className="bg-marino-2/60 backdrop-blur-md border border-marino-4/50 rounded-2xl p-5 h-24 flex flex-col justify-center">
                    <div className="w-24 h-3 rounded-full skeleton-shimmer opacity-40 mb-3"></div>
                    <div className="w-48 h-6 rounded-lg skeleton-shimmer"></div>
                </div>

                {/* Days Section Header */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-gris opacity-50" />
                        <div className="w-40 h-3 rounded-full skeleton-shimmer opacity-20"></div>
                    </div>
                </div>

                {/* Days Grid Skeleton (Matching the Cards) */}
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div 
                            key={i} 
                            className="bg-marino-2 border border-marino-4/50 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden h-[100px]"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-marino-4/30"></div>
                            <div className="pl-2 space-y-3">
                                <div className="w-16 h-2 rounded-full skeleton-shimmer opacity-30"></div>
                                <div className="w-32 h-8 rounded-lg skeleton-shimmer"></div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-marino-3 border border-marino-4 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full skeleton-shimmer opacity-40"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Testeo / Quick Action Skeleton */}
                <div className="bg-gradient-to-br from-naranja/5 to-transparent border border-naranja/10 rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-naranja/5 flex items-center justify-center">
                            <Zap size={20} className="text-naranja/20" />
                        </div>
                        <div className="space-y-2">
                            <div className="w-32 h-3 rounded-full skeleton-shimmer opacity-40"></div>
                            <div className="w-48 h-2 rounded-full skeleton-shimmer opacity-20"></div>
                        </div>
                    </div>
                    <div className="w-20 h-8 rounded-xl skeleton-shimmer opacity-40"></div>
                </div>
            </main>
        </div>
    );
}
