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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
 <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16">
      <div className="mx-auto max-w-screen-2xl">
              {title && (
        <h2 className="text-4xl sm:text-5xl font-semibold text-left md:text-center text-black mb-8">         
          Frequently Asked Questions
        </h2>
      )}

      <div className="flex flex-col sm:flex-row gap-6 w-full">
        <div className="w-full sm:w-[40%]">
          <h3 className="text-2xl text-left font-semibold text-black mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-lg text-left font-medium text-gray-700">{subtitle}</p>
          )}
        </div>

        <div className="w-full sm:w-[60%] mx-auto sm:px-4">
          <div className="space-y-4">
            {data.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full text-left px-5 py-4 bg-[#b0db72] hover:bg-[#64a506] flex justify-between items-center"
                >
                  <span className="text-lg font-bold">{faq.question}</span>
                  <span className="ml-2">
                    {openIndex === index ? "-" : "+"}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-5 py-4 text-lg text-gray-700 bg-white transition-all duration-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
