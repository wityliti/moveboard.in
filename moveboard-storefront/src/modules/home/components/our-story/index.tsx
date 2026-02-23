const OurStory = () => {
    const timeline = [
        {
            label: "Frustration",
            text: "Like many professionals, our days were filled with long hours at desks. We switched between sitting and standing, hoping it would solve the fatigue. It didn't.",
        },
        {
            label: "Curiosity",
            text: "That frustration became curiosity. We studied how weight shifts, how balance feels, how tension and resistance should respond.",
        },
        {
            label: "Creation",
            text: "Curiosity became sketches. Sketches became prototypes. And prototypes became what is now Moveboard™ Flow.",
        },
    ]

    return (
        <section id="story" className="py-24 small:py-32 bg-[#0a0a0a] relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute left-0 top-1/3 w-[300px] h-[300px] bg-[#c4956a] rounded-full blur-[200px] opacity-[0.05]" />

            <div className="content-container">
                <div className="grid grid-cols-1 small:grid-cols-2 gap-16 items-start">
                    {/* Left — Story */}
                    <div>
                        <span className="text-[#c4956a] text-sm font-medium tracking-[0.2em] uppercase mb-4 block">
                            Our Story
                        </span>
                        <h2 className="text-3xl small:text-5xl font-bold text-white mb-6 leading-tight">
                            It Started{" "}
                            <span className="bg-gradient-to-r from-[#c4956a] to-[#d4a04a] bg-clip-text text-transparent">
                                With Us
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                            We are Sushil and Kiranjeet — partners in life, builders by nature,
                            and believers in movement.
                        </p>

                        {/* Timeline */}
                        <div className="space-y-8 relative">
                            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-[#c4956a]/40 via-[#c4956a]/20 to-transparent" />
                            {timeline.map((item, i) => (
                                <div key={i} className="flex gap-6 relative">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#c4956a]/10 border border-[#c4956a]/30 flex items-center justify-center z-10">
                                        <div className="w-3 h-3 rounded-full bg-[#c4956a]" />
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="text-[#c4956a] font-semibold text-sm uppercase tracking-wider mb-2">
                                            {item.label}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Philosophy */}
                    <div className="small:pt-16">
                        <div className="p-8 small:p-10 rounded-3xl bg-gradient-to-br from-[#c4956a]/[0.08] to-transparent border border-[#c4956a]/10">
                            <h3 className="text-white text-xl font-bold mb-6">Our Promise</h3>
                            <div className="space-y-4 text-gray-300">
                                <div className="flex items-start gap-3">
                                    <span className="text-[#c4956a] mt-1">◆</span>
                                    <p className="text-sm leading-relaxed">To design with <strong className="text-white">purpose</strong>.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-[#c4956a] mt-1">◆</span>
                                    <p className="text-sm leading-relaxed">To build with <strong className="text-white">precision</strong>.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-[#c4956a] mt-1">◆</span>
                                    <p className="text-sm leading-relaxed">To move with <strong className="text-white">intention</strong>.</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-[#c4956a]/10">
                                <p className="text-gray-400 text-sm italic leading-relaxed">
                                    &ldquo;The best progress begins with a single shift forward.&rdquo;
                                </p>
                                <p className="text-[#c4956a] text-sm font-medium mt-3">
                                    — Sushil & Kiranjeet, Founders
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                                <p className="text-2xl font-bold text-[#c4956a] mb-1">2+</p>
                                <p className="text-gray-500 text-xs">Years of R&D</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                                <p className="text-2xl font-bold text-[#c4956a] mb-1">100%</p>
                                <p className="text-gray-500 text-xs">Made in India</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OurStory
