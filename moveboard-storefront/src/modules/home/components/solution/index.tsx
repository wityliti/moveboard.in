const Solution = () => {
    const features = [
        {
            label: "Subtle Movement",
            description: "Gentle, continuous micro-adjustments that keep your body awake without disrupting focus.",
        },
        {
            label: "Ergonomic Design",
            description: "Precision-engineered slat articulation and damping system for natural weight distribution.",
        },
        {
            label: "Workspace Ready",
            description: "Elegant enough for the modern office. Silent, compact, and beautifully crafted.",
        },
    ]

    return (
        <section className="py-24 small:py-32 bg-[#0a0a0a] relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#c4956a] rounded-full blur-[200px] opacity-[0.07]" />

            <div className="content-container">
                <div className="grid grid-cols-1 small:grid-cols-2 gap-16 items-center">
                    {/* Left — Product visual placeholder */}
                    <div className="relative">
                        <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/[0.06] overflow-hidden flex items-center justify-center">
                            <div className="relative w-4/5 h-4/5 flex items-center justify-center">
                                {/* Abstract product representation */}
                                <div className="w-64 h-16 rounded-full bg-gradient-to-r from-[#8B6914]/30 via-[#c4956a]/40 to-[#8B6914]/30 blur-sm" />
                                <div className="absolute w-56 h-12 rounded-full bg-gradient-to-r from-[#c4956a]/20 to-[#d4a04a]/20 border border-[#c4956a]/10" />
                                <div className="absolute text-center">
                                    <p className="text-[#c4956a]/60 text-sm tracking-widest uppercase">Moveboard™</p>
                                    <p className="text-[#c4956a] text-2xl font-bold">Flow</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative corner accent */}
                        <div className="absolute -top-3 -right-3 w-24 h-24 border-t-2 border-r-2 border-[#c4956a]/20 rounded-tr-3xl" />
                        <div className="absolute -bottom-3 -left-3 w-24 h-24 border-b-2 border-l-2 border-[#c4956a]/20 rounded-bl-3xl" />
                    </div>

                    {/* Right — Content */}
                    <div>
                        <span className="text-[#c4956a] text-sm font-medium tracking-[0.2em] uppercase mb-4 block">
                            The Solution
                        </span>
                        <h2 className="text-3xl small:text-5xl font-bold text-white mb-6 leading-tight">
                            Moveboard™ Flow
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                            We didn&apos;t want another fitness gadget. We wanted something that
                            felt <em className="text-[#c4956a] not-italic font-medium">natural</em> — something that encouraged subtle, continuous movement
                            while supporting focus instead of distracting from it.
                        </p>

                        <div className="space-y-6">
                            {features.map((feature, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#c4956a]/10 flex items-center justify-center mt-1">
                                        <span className="text-[#c4956a] text-sm font-bold">{String(i + 1).padStart(2, '0')}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">{feature.label}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Solution
