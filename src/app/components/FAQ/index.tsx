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

          <div className="mt-10 p-6 bg-[#f5f7fa] rounded-2xl border border-gray-200">
            <p className="text-gray-600 leading-relaxed">
              Still have questions? Our coaching and support team is always happy to guide you and help you select the perfect training program.
            </p>
          </div>
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
