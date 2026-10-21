import Link from "next/link";

export default function CustomerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white/90 backdrop-blur-xl shadow-[0_-1px_20px_rgba(27,59,43,0.04)] py-8 border-t border-[#1b3b2b]/15 mt-auto">
      <div className="w-full px-6 sm:px-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
          <span className="font-heading font-extrabold text-base tracking-tight text-[#1b3b2b]">
            DineDesk
          </span>
          <span className="hidden sm:inline text-[#1b3b2b]/30">•</span>
          <span className="text-xs font-medium text-[#1b3b2b]/70">
            &copy; {currentYear} DineDesk Hospitality Ltd. All rights reserved.
          </span>
        </div>

        {/* Live Telemetry Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b3b2b]/5 border border-[#1b3b2b]/10 text-[11px] font-bold text-[#1b3b2b]">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Telemetry: All Systems Operational</span>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex items-center gap-6 text-xs font-bold text-[#1b3b2b]/80 flex-wrap justify-center">
          <Link className="hover:text-[#C05621] transition-colors" href="#">
            Privacy Policy
          </Link>
          <Link className="hover:text-[#C05621] transition-colors" href="#">
            Terms of Service
          </Link>
          <Link className="hover:text-[#C05621] transition-colors" href="#">
            Restaurant Inquiries
          </Link>
          <Link className="hover:text-[#C05621] transition-colors" href="#">
            Concierge Desk
          </Link>
        </div>

      </div>
    </footer>
  );
}