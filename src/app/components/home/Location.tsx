export default function Location() {
  return (
    <section className="py-24 px-6 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <section id="locations" className="mx-auto max-w-7xl">

          {/* Heading */}
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <h2 className="text-4xl md:text-4xl font-extrabold leading-tight md:col-span-5 text-gray-900">
              Multiple <span className="text-green-600">Locations</span>
            </h2>

            <p className="text-lg md:text-xl leading-relaxed text-gray-600 md:col-span-7">
              Two training sites in Phoenix &amp; Gilbert — each has its own map and quick link to Google Maps.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-14 grid gap-6 md:grid-cols-2">

            {/* Location Card */}
            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1">
              <div className="p-7">

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-gray-900">
                      Rose Mofford Sports Complex
                    </div>

                    <div className="mt-2 text-base leading-relaxed text-gray-600">
                      <div>9833 N 25th Ave</div>
                      <div>Phoenix, AZ 85021</div>
                      <div>United States</div>
                    </div>
                  </div>

                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                    Phoenix
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                    Outdoor courts
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="h-10 rounded-full bg-green-600 px-5 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition">
                    View
                  </button>

                  <a
                    href="/programs"
                    className="h-10 rounded-full border border-gray-300 px-5 text-base font-semibold text-gray-800 hover:bg-gray-100 transition"
                  >
                    See programs
                  </a>
                </div>
              </div>

              <div className="border-t border-gray-200 bg-white p-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <iframe
                    title="Rose Mofford Sports Complex Map"
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=Rose%20Mofford%20Sports%20Complex%2C%209833%20N%2025th%20Ave%2C%20Phoenix%2C%20AZ%2085021%2C%20United%20States&output=embed"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Second Card — Same Typography Applied */}
            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1">
              <div className="p-7">

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-gray-900">
                      Gilbert Regional Park
                    </div>

                    <div className="mt-2 text-base leading-relaxed text-gray-600">
                      <div>3005 E Queen Creek Rd</div>
                      <div>Gilbert, AZ 85298</div>
                      <div>United States</div>
                    </div>
                  </div>

                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                      className="h-4 w-4" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                    Gilbert
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
                    Regional park
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="h-10 rounded-full bg-green-600 px-5 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition">
                    View
                  </button>

                  <a
                    href="/programs"
                    className="h-10 rounded-full border border-gray-300 px-5 text-base font-semibold text-gray-800 hover:bg-gray-100 transition"
                  >
                    See programs
                  </a>
                </div>
              </div>

              <div className="border-t border-gray-200 bg-white p-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <iframe
                    title="Gilbert Regional Park Map"
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=Gilbert%20Regional%20Park%2C%203005%20E%20Queen%20Creek%20Rd%2C%20Gilbert%2C%20AZ%2085298%2C%20United%20States&output=embed"
                  ></iframe>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </section>
  );
}
