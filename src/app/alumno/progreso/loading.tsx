export default function Loading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full pt-10">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl skeleton-shimmer"></div>
                <div className="space-y-2">
                    <div className="w-48 h-8 rounded-lg skeleton-shimmer"></div>
                    <div className="w-32 h-3 rounded-full skeleton-shimmer"></div>
                </div>
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-marino-2/50 border border-marino-4/50 rounded-2xl p-5 h-28 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-full skeleton-shimmer"></div>
                        <div className="h-6 w-16 rounded-lg skeleton-shimmer"></div>
                    </div>
                ))}
            </div>

            {/* Chart Area Skeleton */}
            <div className="bg-marino-2/50 border border-marino-4/50 p-6 rounded-3xl h-[350px]">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-32 rounded-lg skeleton-shimmer"></div>
                    <div className="h-8 w-24 rounded-full skeleton-shimmer"></div>
                </div>
                <div className="w-full h-56 rounded-xl skeleton-shimmer opacity-50"></div>
            </div>

            {/* Bottom Form Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-marino-2/50 border border-marino-4/50 rounded-3xl p-6 h-[200px]">
                    <div className="h-5 w-40 rounded-lg skeleton-shimmer mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-12 w-full rounded-xl skeleton-shimmer"></div>
                        <div className="h-12 w-1/2 rounded-xl skeleton-shimmer"></div>
                    </div>
                </div>
                <div className="bg-marino-2/50 border border-marino-4/50 rounded-3xl p-6 h-[200px]">
                    <div className="h-5 w-32 rounded-lg skeleton-shimmer mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-4 w-full rounded-full skeleton-shimmer"></div>
                        <div className="h-4 w-5/6 rounded-full skeleton-shimmer"></div>
                        <div className="h-4 w-4/6 rounded-full skeleton-shimmer"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
