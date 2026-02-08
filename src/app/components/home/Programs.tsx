 {/*
const programs = [
  { title: "Junior Academy", tag: "Ages 5–12" },
  { title: "Elite Performance", tag: "Advanced" },
  { title: "Adult Training", tag: "All Levels" },
  { title: "Summer Camps", tag: "Seasonal" },
]; */}

export default function Programs() {
  return (
    <>

    {/* Tennis Programs Section */}
<section className="py-24 bg-[#f5f7fa]">
  <div className="max-w-7xl mx-auto px-6 lg:px-16">

    {/* Header */}
    <div className="text-center max-w-3xl mx-auto mb-20">
       <div className="text-center mb-20">
      <span className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold tracking-wide text-[#7cb342] bg-[#7cb342]/10 rounded-full">
        🎾 Our Programs
      </span></div>
      <h2 className="mt-4 text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
        Professional Training Programs Designed for Champions
      </h2>
      <p className="mt-6 text-lg text-gray-600 leading-relaxed">
        Structured pathways that help players grow technically, physically, and mentally — from beginners to elite competitors.
      </p>
    </div>

    {/* Programs Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

      {/* Card */}
      <div className="group bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500">

        <div className="relative h-60 overflow-hidden">
          <img
            src="https://teamhippa.com/uploads/1767534155122_1763137007118_Beginners_Picture_gilbert.jpg.jpg"
            alt="Junior Tennis Program"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Junior Development
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            A fun, engaging and skill-focused program designed to build strong foundations for young players.
          </p>

          <div className="border-t border-gray-200 pt-5 flex justify-between items-center">
            <span className="text-sm text-gray-500">All Level</span>
            <button className="px-5 py-2 rounded-full bg-[#b0db72] text-white text-sm font-medium hover:opacity-90 transition">
              Explore
            </button>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="group bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500">

        <div className="relative h-60 overflow-hidden">
          <img
            src="https://teamhippa.com/uploads/1756704533659_Adult_class_Gilbert.jpg"
            alt="Adult Tennis Programs"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Adult Tennis Programs
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            Professional level training for tournament players, scholarships and international exposure.
          </p>

          <div className="border-t border-gray-200 pt-5 flex justify-between items-center">
            <span className="text-sm text-gray-500">All Level</span>
            <button className="px-5 py-2 rounded-full bg-[#b0db72] text-white text-sm font-medium hover:opacity-90 transition">
              Explore
            </button>
          </div>
        </div>

        
      </div>

      {/* Card */}
      <div className="group bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500">

        <div className="relative h-60 overflow-hidden">
          <img
            src="https://teamhippa.com/uploads/1767558409428_HP_Picture.jpg"
            alt="Performance Tennis Program"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
           High Performance Training
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            High-intensity technical, tactical and conditioning sessions for competitive players.
          </p>

          <div className="border-t border-gray-200 pt-5 flex justify-between items-center">
            <span className="text-sm text-gray-500">All Level </span>
            <button className="px-5 py-2 rounded-full bg-[#b0db72] text-white text-sm font-medium hover:opacity-90 transition">
              Explore
            </button>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="group bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500">

        <div className="relative h-60 overflow-hidden">
          <img
            src="https://elitetennisacademy.in/wp-content/uploads/2025/12/tennis-balls-raquet-1080-x-717-px-1696508751894-1024x680.webp"
            alt="Elite Tennis Program"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Elite Pathway
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            Professional level training for tournament players, scholarships and international exposure.
          </p>

          <div className="border-t border-gray-200 pt-5 flex justify-between items-center">
            <span className="text-sm text-gray-500">All Level</span>
            <button className="px-5 py-2 rounded-full bg-[#b0db72] text-white text-sm font-medium hover:opacity-90 transition">
              Explore
            </button>
          </div>
        </div>

        
      </div>

      

      {/* Card */}
      <div className="group bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500">

        <div className="relative h-60 overflow-hidden">
          <img
            src="https://teamhippa.com/uploads/1754231725642_Private_Lesson.jpg"
            alt="Private Instruction"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Private Instruction
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            Professional level training for tournament players, scholarships and international exposure.
          </p>

          <div className="border-t border-gray-200 pt-5 flex justify-between items-center">
            <span className="text-sm text-gray-500">All Level</span>
            <button className="px-5 py-2 rounded-full bg-[#b0db72] text-white text-sm font-medium hover:opacity-90 transition">
              Explore
            </button>
          </div>
        </div>

        
      </div>

    </div>

    

  </div>
</section>

</>
  );
}
