export default function Hero() {
  return (
    <section className="relative min-h-[95vh] bg-[#0B1220] overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          className="w-full h-full object-cover opacity-30"
          alt="Tennis Academy"
        />
      </div>

      {/* Diagonal Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent" />

      <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
        
        <div className="grid md:grid-cols-2 gap-12 items-center w-full">

          {/* Left Content */}
          <div className="text-white">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Build  
              <span className="block text-green-400">Champions</span>
              Not Just Players
            </h1>

            <p className="mt-6 text-lg text-gray-300 max-w-xl">
              Elite tennis & pickleball training programs designed to develop world-class athletes.
            </p>

            <div className="mt-10 flex items-center gap-6">
              <button className="px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl shadow-xl transition">
                Book Free Trial
              </button>

              <button className="px-8 py-4 border border-white/30 rounded-xl hover:bg-white hover:text-black transition">
                View Programs
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden md:block">
            <img
              src="/hero-player.png"
              className="relative z-10 scale-110 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              alt="Player"
            />

            {/* Floating Card */}
            <div className="absolute bottom-8 left-0 bg-white rounded-2xl p-6 shadow-2xl max-w-sm">
              <h4 className="font-bold text-lg">Trusted by 1200+ Players</h4>
              <p className="text-sm text-gray-600 mt-1">
                International coaching • Structured programs • Proven results
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
