const Benefits = () => {
    const benefits = [
        {
            title: "Feel Better",
            subtitle: "Release tension",
            description:
                "Gentle balance and micro-adjustments relieve stiffness, improve circulation, and keep your body energized throughout the day.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
            ),
            gradient: "from-rose-500/20 to-[#c4956a]/20",
            iconBg: "bg-rose-500/10",
            iconColor: "text-rose-400",
        },
        {
            title: "Work Better",
            subtitle: "Sustain focus",
            description:
                "Movement fuels cognitive performance. Stay sharp, maintain higher energy levels, and sustain deep focus all day long.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
            ),
            gradient: "from-amber-500/20 to-[#d4a04a]/20",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-400",
        },
        {
            title: "Live Better",
            subtitle: "Build resilience",
            description:
                "Small, consistent movements build strength, improve posture, and cultivate healthier habits that compound over time.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
            ),
            gradient: "from-emerald-500/20 to-[#c4956a]/20",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-400",
        },
    ]

    return (
        <section className="py-24 small:py-32 bg-[#0f0f0f] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c4956a]/20 to-transparent" />

            <div className="content-container">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="text-[#c4956a] text-sm font-medium tracking-[0.2em] uppercase mb-4 block">
                        Benefits
                    </span>
                    <h2 className="text-3xl small:text-5xl font-bold text-white mb-6">
                        Keep Your Mind & Body Happy
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Movement is not about intensity — it&apos;s about <em className="text-[#c4956a] not-italic font-medium">consistency</em>. Small shifts. Gentle balance. Micro-adjustments that keep your body awake.
                    </p>
                </div>

                {/* Benefits grid */}
                <div className="grid grid-cols-1 small:grid-cols-3 gap-8">
                    {benefits.map((benefit, i) => (
                        <div
                            key={i}
                            className="group relative p-8 small:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-[#c4956a]/20 transition-all duration-700 overflow-hidden"
                        >
                            {/* Hover gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                            <div className="relative z-10">
                                <div className={`w-16 h-16 rounded-2xl ${benefit.iconBg} flex items-center justify-center ${benefit.iconColor} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    {benefit.icon}
                                </div>
                                <h3 className="text-white text-2xl font-bold mb-1">{benefit.title}</h3>
                                <p className="text-[#c4956a] text-sm font-medium mb-4">{benefit.subtitle}</p>
                                <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Benefits
