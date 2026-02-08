export default function Coaches() {
  return (

    <section className="py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold">
          Meet Our <span className="text-green-500">Coaches</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {[1, 2, 3].map((c) => (
            <div key={c} className="bg-white rounded-2xl p-6 shadow-md">
              <img
                src="/coach.jpg"
                className="rounded-xl h-56 w-full object-cover"
              />
              <h3 className="mt-4 text-xl font-semibold">Coach Name</h3>
              <p className="text-slate-500">ITF Certified</p>
            </div>
          ))}
        </div>
      </div>
    </section>

);
}
