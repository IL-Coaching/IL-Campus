export default function Loading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full pt-10">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-xl skeleton-shimmer"></div>
                <div className="space-y-2">
                    <div className="w-48 h-8 rounded-lg skeleton-shimmer"></div>
                    <div className="w-64 h-3 rounded-full skeleton-shimmer opacity-50"></div>
                </div>
            </div>

            {/* Microcycles Tabs Skeleton */}
            <div className="flex gap-2 overflow-x-hidden border-b border-marino-4 pb-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-32 h-10 rounded-[10px] skeleton-shimmer shrink-0"></div>
                ))}
            </div>

            {/* Session Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-marino-2/50 border border-marino-4/50 rounded-3xl p-6 h-[300px] flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-6 w-24 rounded-lg skeleton-shimmer"></div>
                                <div className="h-4 w-12 rounded-full skeleton-shimmer"></div>
                            </div>
                            <div className="h-4 w-40 rounded-full skeleton-shimmer mb-6"></div>

                            <div className="space-y-4">
                                <div className="h-10 w-full rounded-lg skeleton-shimmer"></div>
                                <div className="h-10 w-full rounded-lg skeleton-shimmer"></div>
                                <div className="h-10 w-2/3 rounded-lg skeleton-shimmer opacity-80"></div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-marino-4/50">
                            <div className="h-10 w-full rounded-xl skeleton-shimmer"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
