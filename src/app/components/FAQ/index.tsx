'use client';
import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  title?: string;
  subtitle?: string;
  data: FAQItem[];
};

export default function FAQ({ title, subtitle, data }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-28 bg-white overflow-hidden">

      {/* Soft Background Shapes */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#b0db72]/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gray-200/70 rounded-full blur-[90px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

        {/* Left Content */}
        <div>
          <span className="inline-block mb-5 px-5 py-2 text-sm font-medium rounded-full bg-[#b0db72]/15 text-[#5d8f32]">
            FAQs & Support
          </span>

          <h2 className="text-4xl md:text-4xl font-semibold leading-tight text-gray-900">
            {title || "Frequently Asked Questions"}
          </h2>

          {subtitle && (
            <p className="mt-6 text-lg text-gray-600 max-w-lg">
              {subtitle}
            </p>
          )}

          <div className="mt-16 relative overflow-hidden bg-white rounded-3xl border border-green-100 shadow-sm p-10">

  {/* Subtle Background Accent */}
  <div className="absolute top-0 right-0 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

  <div className="relative text-center sm:text-left">
    <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto sm:mx-0">
      Still have questions? Our coaching and support team is always happy to guide you
      and help you select the perfect training program.
    </p>

    <div className="mt-10 flex flex-col sm:flex-row gap-5 justify-center sm:justify-start">

      {/* Call Button – Secondary */}
      <a
        href="tel:+16023413361"
        className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl
                   border-2 border-green-600 text-green-700 font-semibold
                   bg-white hover:bg-green-600 hover:text-white
                   transition-all duration-300 ease-out
                   shadow-sm hover:shadow-lg hover:-translate-y-1"
      >
        <span className="text-lg transition-transform duration-300 group-hover:scale-110">
          📞
        </span>
        <span>
          Call Us
          <span className="block text-sm font-medium opacity-80 group-hover:opacity-100">
            +1-602-341-3361
          </span>
        </span>
      </a>

      {/* Email Button – Primary */}
      <a
        href="https://teamhippa.com/contact"
        className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl
                   bg-green-600 text-white font-semibold
                   hover:bg-green-700
                   transition-all duration-300 ease-out
                   shadow-md hover:shadow-xl hover:-translate-y-1"
      >
        <span className="text-lg transition-transform duration-300 group-hover:scale-110">
          ✉️
        </span>
        <span>
          Email Us
          <span className="block text-sm font-medium opacity-90">
            info@teamhippa.com
          </span>
        </span>
      </a>

    </div>
  </div>
</div>



          {/* Footer/Bottom CTA */}

        </div>

        {/* Right FAQ Stack */}
        <div className="relative space-y-6">
          {data.map((faq, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl border border-gray-200 transition-all duration-500 cursor-pointer
                ${openIndex === index
                  ? "shadow-xl scale-[1.02] border-[#b0db72]"
                  : "shadow-md hover:shadow-lg"
                }`}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="px-7 py-6 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 pr-6">
                  {faq.question}
                </h3>

                <div className={`w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center transition-all
                  ${openIndex === index ? "bg-[#b0db72] border-[#b0db72] text-white rotate-45" : "text-gray-500"}`}>
                  +
                </div>
              </div>

              <div className={`overflow-hidden transition-all duration-500 ease-in-out
                ${openIndex === index ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-7 pb-6 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
