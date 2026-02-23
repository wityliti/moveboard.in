import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#c4956a] rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#d4a04a] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B6914] rounded-full blur-[200px] opacity-20" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c4956a]/30 bg-[#c4956a]/10 backdrop-blur-sm mb-8 animate-fade-in-top">
          <span className="w-2 h-2 rounded-full bg-[#d4a04a] animate-pulse" />
          <span className="text-[#c4956a] text-sm font-medium tracking-wide">
            Designed in India — Crafted for Movement
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl small:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
          Movement is{" "}
          <span className="bg-gradient-to-r from-[#c4956a] via-[#d4a04a] to-[#c4956a] bg-clip-text text-transparent">
            Momentum
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg small:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Moveboard™ Flow — the active standing board that makes movement
          intuitive. Not forced. Not extreme. Just natural.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col small:flex-row items-center justify-center gap-4">
          <LocalizedClientLink
            href="/store"
            className="group relative px-8 py-4 bg-gradient-to-r from-[#c4956a] to-[#d4a04a] text-[#0a0a0a] font-semibold rounded-full text-base transition-all duration-300 hover:shadow-[0_0_40px_rgba(196,149,106,0.4)] hover:scale-105"
          >
            <span className="relative z-10">Shop Flow →</span>
          </LocalizedClientLink>
          <a
            href="#story"
            className="px-8 py-4 border border-white/20 text-white/80 font-medium rounded-full text-base transition-all duration-300 hover:border-[#c4956a]/50 hover:text-[#c4956a] hover:bg-[#c4956a]/5"
          >
            Our Story
          </a>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-8 mt-16 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#c4956a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Engineered Precision</span>
          </div>
          <div className="hidden small:flex items-center gap-2">
            <svg className="w-5 h-5 text-[#c4956a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Premium Materials</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#c4956a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            <span>Made in India</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 animate-bounce">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  )
}

export default Hero
