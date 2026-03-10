export default function DashboardLoading() {
    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl skeleton-shimmer"></div>
                <div className="space-y-2">
                    <div className="h-3 w-24 rounded-full skeleton-shimmer"></div>
                    <div className="h-6 w-48 rounded-lg skeleton-shimmer"></div>
                </div>
            </div>

            {/* Top Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-marino-2/50 border border-marino-4/50 p-6 rounded-3xl h-32 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-16 rounded-full skeleton-shimmer"></div>
                            <div className="w-8 h-8 rounded-full skeleton-shimmer"></div>
                        </div>
                        <div className="h-8 w-24 rounded-lg skeleton-shimmer mt-4"></div>
                    </div>
                ))}
            </div>

            {/* Main Content Area Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-marino-2/50 border border-marino-4/50 rounded-3xl p-6 h-[400px]">
                    <div className="h-6 w-48 rounded-md skeleton-shimmer mb-8"></div>
                    <div className="w-full h-64 rounded-xl skeleton-shimmer"></div>
                </div>
                <div className="lg:col-span-1 bg-marino-2/50 border border-marino-4/50 rounded-3xl p-6 h-[400px]">
                    <div className="h-6 w-32 rounded-md skeleton-shimmer mb-8"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 w-full rounded-full skeleton-shimmer"></div>
                                    <div className="h-2 w-2/3 rounded-full skeleton-shimmer opacity-50"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
