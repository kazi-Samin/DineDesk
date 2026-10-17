import { CUSTOMER_REVIEWS } from "@/data/restaurants";

export default function TestimonialsSection() {
  return (
    <section className="w-full py-space-xl bg-surface-container-low">
      <div className="max-w-[1440px] mx-auto px-margin">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md pb-space-lg mb-space-lg">
          <div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
              Customer Reviews
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              What Diners Say
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Real feedback from food lovers and regular diners in Dhaka.
            </p>
          </div>
          <div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md font-semibold">
            <span className="material-symbols-outlined text-base">forum</span>
            <span>Over 14,000 reservations &amp; orders completed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {CUSTOMER_REVIEWS.map((review) => (
            <article
              key={review.id}
              className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-secondary mb-space-md">
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                </div>
                <blockquote className="font-headline-sm italic text-primary leading-relaxed">
                  {review.quote}
                </blockquote>
              </div>
              <div className="pt-space-lg mt-space-lg flex items-center gap-space-sm bg-surface-container/60 p-space-sm rounded-lg border border-outline-variant/40">
                <div
                  className={`w-10 h-10 rounded-full ${review.badgeColorClass} flex items-center justify-center font-bold ${review.textColorClass} text-sm`}
                >
                  {review.authorInitials}
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-semibold">
                    {review.authorName}
                  </p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    {review.authorLocation}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
