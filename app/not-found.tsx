import Link from "next/link";

export default function NotFound() {
  return (
    <main className="w-full pt-28 pb-20 bg-surface min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-margin text-center">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-md border border-outline-variant">
          <div className="w-16 h-16 rounded-full bg-surface-container-high text-primary mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl">restaurant</span>
          </div>
          <h1 className="font-headline-lg text-primary text-2xl font-bold">Page Not Found</h1>
          <p className="font-body-md text-on-surface-variant mt-2 text-sm">
            The culinary destination or order you are looking for does not exist.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-primary-container text-on-primary rounded font-label-md font-semibold text-sm hover:bg-primary transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/explore"
              className="px-5 py-2.5 bg-surface-container-high text-primary rounded font-label-md font-semibold text-sm hover:bg-surface-container-highest transition-colors"
            >
              Browse Restaurants
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
