import Link from "next/link";

export default function CustomerFooter() {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_6px_rgba(0,0,0,0.02)] py-space-xl border-t border-outline-variant/30 mt-space-xl">
      <div className="w-full px-space-xl max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm flex-wrap justify-center md:justify-start">
          <span className="font-headline-sm text-headline-sm text-primary font-medium">
            DineDesk
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024 DineDesk Hospitality Ltd. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-space-lg font-label-sm text-label-sm text-on-surface-variant flex-wrap justify-center">
          <Link className="hover:text-on-surface transition-colors" href="#">
            Privacy Policy
          </Link>
          <Link className="hover:text-on-surface transition-colors" href="#">
            Terms of Service
          </Link>
          <Link className="hover:text-on-surface transition-colors" href="#">
            Restaurant Inquiries
          </Link>
          <Link className="hover:text-on-surface transition-colors" href="#">
            Concierge Desk
          </Link>
        </div>
      </div>
    </footer>
  );
}
