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

            {/* Config Forms Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form 1 */}
                <div className="bg-marino-2/50 border border-marino-4/50 rounded-3xl p-8">
                    <div className="h-6 w-32 rounded-lg skeleton-shimmer mb-6"></div>
                    <div className="space-y-6">
                        <div>
                            <div className="h-4 w-24 rounded-full skeleton-shimmer mb-2"></div>
                            <div className="h-12 w-full rounded-xl skeleton-shimmer"></div>
                        </div>
                        <div>
                            <div className="h-4 w-32 rounded-full skeleton-shimmer mb-2"></div>
                            <div className="h-12 w-full rounded-xl skeleton-shimmer"></div>
                        </div>
                        <div className="h-12 w-48 rounded-xl skeleton-shimmer mt-4"></div>
                    </div>
                </div>

                {/* Form 2 */}
                <div className="bg-marino-2/50 border border-marino-4/50 rounded-3xl p-8">
                    <div className="h-6 w-40 rounded-lg skeleton-shimmer mb-6"></div>
                    <div className="space-y-6">
                        <div>
                            <div className="h-4 w-24 rounded-full skeleton-shimmer mb-2"></div>
                            <div className="h-12 w-full rounded-xl skeleton-shimmer"></div>
                        </div>
                        <div>
                            <div className="h-4 w-32 rounded-full skeleton-shimmer mb-2"></div>
                            <div className="h-12 w-full rounded-xl skeleton-shimmer"></div>
                        </div>
                        <div className="h-12 w-48 rounded-xl skeleton-shimmer mt-4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
