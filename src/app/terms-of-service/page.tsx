export default function TermsCondition() {
  return (
    <>
      <section className="bg-gradient-to-r from-[#b0db72] to-[#3a702b] py-20 px-4 text-center">
        <div className="max-w-screen-xl  mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Terms & Conditions
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-white">
            Last updated: August 22, 2025
          </p>
        </div>
      </section>
      <section className="w-full -mt-16 z-10 px-4 pb-6 md:pb-12">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-lg shadow-xl border border-gray-200">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Introduction
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              Welcome to [Your Website/Company Name]! These Terms and Conditions
              (&quot;Terms&quot;) govern your use of our website, services, and products
              (&quot;Service&quot;). By accessing or using the Service, you agree to be
              bound by these Terms. If you disagree with any part of the terms,
              then you may not access the Service.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              User Accounts
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-4">
              When you create an account with us, you must provide information
              that is accurate, complete, and current at all times. Failure to
              do so constitutes a breach of the Terms, which may result in
              immediate termination of your account on our Service.
            </p>
            <ul className="list-disc list-inside space-y-3 text-base sm:text-lg text-gray-600 leading-relaxed">
              <li>
                You are responsible for safeguarding the password that you use
                to access the Service and for any activities or actions under
                your password.
              </li>
              <li>
                You agree not to disclose your password to any third party. You
                must notify us immediately upon becoming aware of any breach of
                security or unauthorized use of your account.
              </li>
            </ul>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Intellectual Property
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              The Service and its original content, features, and functionality
              are and will remain the exclusive property of [Your Company Name]
              and its licensors. The Service is protected by copyright,
              trademark, and other laws of both the [Your Country] and foreign
              countries. Our trademarks and trade dress may not be used in
              connection with any product or service without the prior written
              consent of [Your Company Name].
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Links To Other Websites
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              Our Service may contain links to third-party websites or services
              that are not owned or controlled by [Your Company Name]. [Your
              Company Name] has no control over and assumes no responsibility
              for, the content, privacy policies, or practices of any third
              party websites or services. You further acknowledge and agree that
              [Your Company Name] shall not be responsible or liable, directly
              or indirectly, for any damage or loss caused or alleged to be
              caused by or in connection with the use of or reliance on any such
              content, goods, or services available on or through any such
              websites or services.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Termination
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              We may terminate or suspend your account and bar access to the
              Service immediately, without prior notice or liability, under our
              sole discretion, for any reason whatsoever and without limitation,
              including but not limited to a breach of the Terms.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Disclaimer
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              Your use of the Service is at your sole risk. The Service is
              provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The Service is
              provided without warranties of any kind, whether express or
              implied, including, but not limited to, implied warranties of
              merchantability, fitness for a particular purpose, non-infringement,
              or course of performance.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Governing Law
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              These Terms shall be governed and construed in accordance with the
              laws of [Your Country], without regard to its conflict of law
              provisions. Our failure to enforce any right or provision of these
              Terms will not be considered a waiver of those rights.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Changes to Terms
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will
              provide at least 30 days&apos; notice prior to any new terms taking
              effect. What constitutes a material change will be determined at
              our sole discretion.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}