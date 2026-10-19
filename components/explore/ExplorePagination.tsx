"use client";

interface ExplorePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
}

export default function ExplorePagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
}: ExplorePaginationProps) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * 10 + 1;
    const endItem = Math.min(currentPage * 10, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 pb-4 border-t border-outline-variant/40 mt-8">
            <p className="text-xs text-on-surface-variant font-medium">
                Showing <span className="font-bold text-primary">{startItem}</span> to <span className="font-bold text-primary">{endItem}</span> of <span className="font-bold text-primary">{totalItems}</span> master dishes
            </p>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl border border-outline-variant/70 text-xs font-bold bg-surface-container-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    type="button"
                >
                    Previous
                </button>

                <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first, last, current, and surrounding pages
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === page
                                            ? "bg-primary text-on-primary shadow-md scale-105"
                                            : "border border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary"
                                        }`}
                                    type="button"
                                >
                                    {page}
                                </button>
                            );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-1 text-on-surface-variant font-bold">...</span>;
                        }
                        return null;
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-xl border border-outline-variant/70 text-xs font-bold bg-surface-container-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    type="button"
                >
                    Next
                </button>
            </div>
        </div>
    );
}