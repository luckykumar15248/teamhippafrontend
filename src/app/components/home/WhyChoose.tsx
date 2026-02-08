export default function Experience() {
  return (
    <section className="py-24 px-6 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <h2 className="text-4xl md:text-4xl font-extrabold leading-tight text-gray-900 md:col-span-5">
            Why players choose{" "}
            <span className="text-green-600">Team Hippa</span>
          </h2>

          <p className="text-lg md:text-xl leading-relaxed text-gray-600 md:col-span-7">
            A clear pathway, structured coaching, and a community that keeps players coming back — on and off the court.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">

          {/* Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 text-lg font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Quality coaching staff
                </h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                  Experienced, vetted coaches following a unified curriculum so each session builds on the last.
                </p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 text-lg font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Player development pathway
                </h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                  Clear levels from red-ball beginners to performance groups, making progress transparent for players and parents.
                </p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 text-lg font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Community & culture
                </h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                  A welcoming environment focused on effort, respect, and growth — not just results on the board.
                </p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 text-lg font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Simple online booking
                </h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                  Find a program, pick a time, and book in seconds from any device, with instant confirmations and reminders.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
