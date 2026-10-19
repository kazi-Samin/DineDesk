export default function DinerReviews() {
    return (
        <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-3xl p-8 shadow-sm flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-6">
                <div>
                    <h3 className="font-heading font-extrabold text-2xl text-primary">
                        Diner Experiences &amp; Reviews
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium">
                        Real feedback from verified reservation guests.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-surface-container p-4 rounded-2xl border border-outline-variant/60">
                    <span className="font-heading font-black text-3xl text-primary">4.9</span>
                    <div className="flex flex-col gap-1 text-[11px] font-bold text-on-surface-variant">
                        <span>★★★★★ (628 ratings)</span>
                        <span className="text-primary">99% Recommendation</span>
                    </div>
                </div>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { name: "Zubair Rahman", date: "2 days ago", comment: "The Special Mutton Kaacchi Biryani is unmatched! Tender meat steeped in rich spices." },
                    { name: "Nusrat Azam", date: "Oct 20, 2026", comment: "Atmosphere is majestic and royal. The Shahi Borhani was exceptionally refreshing." },
                    { name: "Tanvir Chowdhury", date: "Oct 18, 2026", comment: "Flawless service and unforgettable culinary experience. Will return very soon!" },
                ].map((rev, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/60 flex flex-col justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-primary">{rev.name}</span>
                                <span className="text-[10px] text-secondary font-bold">Verified Diner</span>
                            </div>
                            <div className="text-amber-500 text-xs">★★★★★</div>
                            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                                "{rev.comment}"
                            </p>
                        </div>
                        <span className="text-[10px] text-outline">{rev.date}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}