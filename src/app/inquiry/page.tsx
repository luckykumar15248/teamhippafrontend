import Inquiry from "../components/Inquiry-form";

const InquiryPage: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-md rounded-xl">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          Inquiry Form
        </h2>

       <Inquiry />

      </div>
    </div>
  );
};

export default InquiryPage;
