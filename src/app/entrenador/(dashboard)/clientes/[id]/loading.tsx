export default function Loading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full">
            {/* Header / Breadcrumb Skeleton */}
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg skeleton-shimmer"></div>
                <div className="space-y-2">
                    <div className="w-32 h-3 rounded-full skeleton-shimmer"></div>
                    <div className="w-64 h-8 rounded-lg skeleton-shimmer"></div>
                </div>
            </div>

            {/* Administrador de Pestañas Skeleton */}
            <div className="space-y-6">
                <div className="flex gap-2 border-b border-marino-4 pb-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-32 h-10 rounded-xl skeleton-shimmer hidden md:block"></div>
                    ))}
                    {[1, 2].map((i) => (
                        <div key={`m-${i}`} className="w-24 h-10 rounded-xl skeleton-shimmer md:hidden"></div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Izquierda Skeleton (Profile Info) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-marino-2 border border-marino-4 rounded-2xl p-6 h-80 flex flex-col items-center justify-center space-y-6">
                            <div className="w-24 h-24 rounded-full skeleton-shimmer"></div>
                            <div className="h-6 w-3/4 rounded-md skeleton-shimmer"></div>
                            <div className="h-4 w-1/2 rounded-md skeleton-shimmer"></div>
                            <div className="flex gap-2 mt-4 w-full">
                                <div className="h-8 flex-1 rounded-md skeleton-shimmer"></div>
                                <div className="h-8 flex-1 rounded-md skeleton-shimmer"></div>
                            </div>
                        </div>

                        <div className="h-16 w-full rounded-2xl skeleton-shimmer"></div>
                        <div className="h-16 w-full rounded-2xl skeleton-shimmer"></div>
                    </div>

                    {/* Columna Derecha Skeleton (Notas) */}
                    <div className="lg:col-span-2">
                        <div className="bg-marino-2 border border-marino-4 rounded-2xl p-6 h-[400px]">
                            <div className="h-4 w-48 rounded-md skeleton-shimmer mb-6"></div>
                            <div className="w-full h-full rounded-xl skeleton-shimmer opacity-50"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
