import Link from "next/link";

export default function VendorNotFound() {
    return (
        <div className="min-h-[80vh] w-full flex items-center justify-center p-6 bg-[#FBFBFA]">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#1b3b2b]/10 shadow-sm text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl">table_restaurant</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C05621] bg-[#C05621]/10 px-2.5 py-0.5 rounded-full mb-2">
                    Record Not Found
                </span>
                <h2 className="text-xl font-bold text-[#1b3b2b]">Vendor Resource Missing</h2>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    The requested station, table reservation, or ticket order could not be located in your active shift records.
                </p>
                <Link
                    href="/dashboard/vendor"
                    className="mt-6 px-6 py-2.5 bg-[#1b3b2b] text-white rounded-xl text-xs font-bold hover:bg-[#1b3b2b]/90 transition-all shadow-xs"
                >
                    Return to Operations Console
                </Link>
            </div>
        </div>
    );
}