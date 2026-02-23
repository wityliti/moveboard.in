const Problem = () => {
    const stats = [
        { number: "80%", label: "of workers experience back pain from prolonged sitting" },
        { number: "15+", label: "hours per day the average professional spends sedentary" },
        { number: "60%", label: "increase in fatigue and brain fog linked to inactivity" },
    ]

    const painPoints = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "Fatigue & Brain Fog",
            description: "Long hours at a desk drain your energy and cloud your thinking.",
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
            ),
            title: "Pain & Stiffness",
            description: "Your body wasn't made to be still. Stiffness builds silently.",
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
            ),
            title: "Stress & Anxiety",
            description: "A sedentary body fuels a restless mind. Movement breaks the cycle.",
        },
    ]

    return (
        <section className="py-24 small:py-32 bg-[#0f0f0f] relative overflow-hidden">
            {/* Subtle accent */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c4956a]/20 to-transparent" />

            <div className="content-container">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="text-[#c4956a] text-sm font-medium tracking-[0.2em] uppercase mb-4 block">
                        The Problem
                    </span>
                    <h2 className="text-3xl small:text-5xl font-bold text-white mb-6">
                        It&apos;s Not Working for Us
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Desk-bound work is taking a toll. The solution to sitting isn&apos;t just standing — the real solution is <em className="text-[#c4956a] not-italic font-medium">movement</em>.
                    </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 small:grid-cols-3 gap-6 mb-16">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="text-center p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
                        >
                            <div className="text-4xl small:text-5xl font-bold bg-gradient-to-r from-[#c4956a] to-[#d4a04a] bg-clip-text text-transparent mb-3">
                                {stat.number}
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Pain points */}
                <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
                    {painPoints.map((point, i) => (
                        <div
                            key={i}
                            className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#c4956a]/30 transition-all duration-500 hover:bg-[#c4956a]/[0.03]"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#c4956a]/10 flex items-center justify-center text-[#c4956a] mb-5 group-hover:bg-[#c4956a]/20 transition-colors duration-500">
                                {point.icon}
                            </div>
                            <h3 className="text-white text-lg font-semibold mb-3">{point.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{point.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Problem
