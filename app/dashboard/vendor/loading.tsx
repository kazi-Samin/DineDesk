export default function VendorLoading() {
    return (
        <div className="w-full min-h-screen bg-[#FBFBFA] p-6 lg:p-10 flex flex-col gap-8 animate-pulse antialiased">
            {/* Top Banner Skeleton */}
            <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#1b3b2b]/10 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex flex-col gap-3">
                    <div className="h-4 w-32 bg-neutral-200 rounded-full" />
                    <div className="h-8 w-64 bg-neutral-200 rounded-xl" />
                    <div className="h-3 w-48 bg-neutral-100 rounded-full" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 w-28 bg-[#FBFBFA] rounded-2xl border border-neutral-200/60" />
                    ))}
                </div>
            </div>

            {/* Main Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="h-6 w-44 bg-neutral-200 rounded-lg" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 bg-white rounded-2xl border border-neutral-200/60" />
                    ))}
                </div>
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="h-6 w-36 bg-neutral-200 rounded-lg" />
                    <div className="h-80 bg-white rounded-3xl border border-neutral-200/60" />
                </div>
            </div>
        </div>
    );
}