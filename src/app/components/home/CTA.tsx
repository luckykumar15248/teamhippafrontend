export default function CTA() {
  return (

    <>
      <section className="py-24 px-6 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">

          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-12 md:p-16 text-center">


            <div className="text-center mb-20">
              <span className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold tracking-wide text-[#7cb342] bg-[#7cb342]/10 rounded-full">
                Membership Program
              </span></div>
            <h2 className="text-4xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
              Join The <span className="text-green-600">Team Hippa</span> Tennis Academy
            </h2>

            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed mb-10">
              Train with elite coaches, structured programs, and a proven development pathway.
              Start your professional tennis journey today.
            </p>

            {/* Offer Card */}
            <div className="inline-flex items-center justify-center px-8 py-4 bg-gray-50 border border-gray-200 rounded-xl mb-10">
              <span className="text-lg font-semibold text-gray-800">
                🎁 New Member Offer — <span className="text-green-600 font-bold">15% OFF</span> Your First Class
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-6">
              <button

                className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-xl shadow-sm transition-all"
              >
                Join Now
              </button>

              <a
                href="tel:+16023413361"
                className="px-12 py-4 border border-gray-300 text-gray-800 font-semibold text-lg rounded-xl hover:bg-gray-100 transition"
              >
                Call Now
              </a>
            </div>

          </div>

        </div>
      </section>

    </>

  );
}
