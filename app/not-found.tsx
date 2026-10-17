import Link from "next/link";

export default function NotFound() {
  return (
    <main className="w-full pt-28 pb-20 bg-surface min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-margin text-center">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-xs border border-outline-variant/60">
          <div className="w-16 h-16 rounded-full bg-surface-container text-primary mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl">restaurant</span>
          </div>
          <h1 className="font-headline-lg text-primary text-2xl font-medium">Page Not Found</h1>
          <p className="font-body-md text-on-surface-variant mt-2 text-sm">
            The page or restaurant you are looking for doesn&apos;t exist or may have been moved.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-xs"
            >
              Return Home
            </Link>
            <Link
              href="/explore"
              className="px-5 py-2.5 bg-surface-container border border-outline-variant text-primary rounded-lg font-medium text-sm hover:bg-surface-container-high transition-colors"
            >
              Browse Restaurants
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
