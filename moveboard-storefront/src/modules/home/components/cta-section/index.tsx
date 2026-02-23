import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CTASection = () => {
    return (
        <section className="py-24 small:py-32 bg-[#0a0a0a] relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#c4956a] rounded-full blur-[200px] opacity-[0.08]" />
            </div>

            <div className="content-container relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Main CTA */}
                    <div className="p-12 small:p-20 rounded-[2rem] bg-gradient-to-br from-[#c4956a]/[0.08] via-transparent to-[#d4a04a]/[0.05] border border-[#c4956a]/15 relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-[#c4956a]/10 rounded-tr-[2rem]" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-[#c4956a]/10 rounded-bl-[2rem]" />

                        <span className="text-[#c4956a] text-sm font-medium tracking-[0.2em] uppercase mb-6 block">
                            Join the Movement
                        </span>
                        <h2 className="text-3xl small:text-5xl font-bold text-white mb-6 leading-tight">
                            Ready to{" "}
                            <span className="bg-gradient-to-r from-[#c4956a] to-[#d4a04a] bg-clip-text text-transparent">
                                Flow
                            </span>
                            ?
                        </h2>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                            Experience the active standing board designed for your workspace.
                            Movement made simple. Movement made beautiful.
                        </p>

                        <div className="flex flex-col small:flex-row items-center justify-center gap-4">
                            <LocalizedClientLink
                                href="/store"
                                className="group px-10 py-4 bg-gradient-to-r from-[#c4956a] to-[#d4a04a] text-[#0a0a0a] font-semibold rounded-full text-base transition-all duration-300 hover:shadow-[0_0_60px_rgba(196,149,106,0.3)] hover:scale-105"
                            >
                                Shop Moveboard™ Flow →
                            </LocalizedClientLink>
                            <a
                                href="mailto:hello@moveboard.in"
                                className="px-10 py-4 border border-white/20 text-white/80 font-medium rounded-full text-base transition-all duration-300 hover:border-[#c4956a]/50 hover:text-[#c4956a]"
                            >
                                Contact Us
                            </a>
                        </div>

                        {/* Trust badges */}
                        <div className="flex items-center justify-center gap-6 small:gap-10 mt-12 text-gray-500 text-xs">
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#c4956a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                                Free Shipping
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#c4956a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.182-3.182" />
                                </svg>
                                30-Day Returns
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#c4956a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Premium Quality
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CTASection
