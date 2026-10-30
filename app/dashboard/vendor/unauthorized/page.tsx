import Link from "next/link";

export default function VendorUnauthorizedPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#FBFBFA]">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-sm text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl">lock</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full mb-2">
                    Vendor Access Required
                </span>
                <h2 className="text-xl font-bold text-[#1b3b2b]">Restricted Console Area</h2>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    This portal is reserved for registered DineDesk restaurant managers and kitchen partners. Please sign in with an authorized vendor account.
                </p>
                <div className="flex flex-col gap-2.5 w-full mt-6">
                    <Link
                        href="/login"
                        className="w-full py-2.5 bg-[#1b3b2b] text-white rounded-xl text-xs font-bold hover:bg-[#1b3b2b]/90 transition-all shadow-xs text-center"
                    >
                        Switch Account
                    </Link>
                    <Link
                        href="/dashboard/customer"
                        className="w-full py-2.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl text-xs font-bold transition-all text-center"
                    >
                        Go to Customer Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}