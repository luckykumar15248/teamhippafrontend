import Link from "next/link";
import Meta from "../components/Meta";

export default function PrivacyPolicy() {
  return (
    <>
      <Meta
        title="Privacy Policy | Team Hippa Tennis Academy"
        description="Read Team Hippa’s Privacy Policy to learn how we collect, use, and protect your personal information."
        image="/images/privacy-policy.png"
        url="https://teamhippa.com/privacy-policy"
      />
      <section className="bg-gradient-to-r from-[#b0db72] to-[#3a702b] py-20 px-4 text-center">
        <div className="max-w-screen-xl  mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Privacy Policy
          </h1>
        </div>
      </section>
      <section className="w-full -mt-16 z-10 px-4 pb-6 md:pb-12">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-lg shadow-xl border border-gray-200">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Who we are
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              Suggested text: Our website address is:&nbsp;
              <Link
                href="http://52.33.220.13."
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                http://52.33.220.13.
              </Link>
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comments</h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-4">
              Suggested text: When visitors leave comments on the site we
              collect the data shown in the comments form, and also the
              visitor’s IP address and browser user agent string to help spam
              detection.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              An anonymized string created from your email address (also called
              a hash) may be provided to the Gravatar service to see if you are
              using it. The Gravatar service privacy policy is available
              here:&nbsp;
              <Link
                href="https://automattic.com/privacy/"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                https://automattic.com/privacy/
              </Link>
              . After approval of your comment, your profile picture is visible
              to the public in the context of your comment.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Media</h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-4">
              Suggested text: If you upload images to the website, you should
              avoid uploading images with embedded location data (EXIF GPS)
              included. Visitors to the website can download and extract any
              location data from images on the website.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cookies</h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-4">
              Suggested text: If you leave a comment on our site you may opt-in
              to saving your name, email address and website in cookies. These
              are for your convenience so that you do not have to fill in your
              details again when you leave another comment. These cookies will
              last for one year.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-4">
              If you visit our login page, we will set a temporary cookie to
              determine if your browser accepts cookies. This cookie contains no
              personal data and is discarded when you close your browser.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-4">
              When you log in, we will also set up several cookies to save your
              login information and your screen display choices. Login cookies
              last for two days, and screen options cookies last for a year. If
              you select &quot;Remember Me&quot;, your login will persist for
              two weeks. If you log out of your account, the login cookies will
              be removed.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              If you edit or publish an article, an additional cookie will be
              saved in your browser. This cookie includes no personal data and
              simply indicates the post ID of the article you just edited. It
              expires after 1 day.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Embedded content from other websites
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-4">
              Suggested text: Articles on this site may include embedded content
              (e.g. videos, images, articles, etc.). Embedded content from other
              websites behaves in the exact same way as if the visitor has
              visited the other website.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              These websites may collect data about you, use cookies, embed
              additional third-party tracking, and monitor your interaction with
              that embedded content, including tracking your interaction with
              the embedded content if you have an account and are logged in to
              that website.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Who we share your data with
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              Suggested text: If you request a password reset, your IP address
              will be included in the reset email.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How long we retain your data
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-4">
              Suggested text: If you leave a comment, the comment and its
              metadata are retained indefinitely. This is so we can recognize
              and approve any follow-up comments automatically instead of
              holding them in a moderation queue.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              For users that register on our website (if any), we also store the
              personal information they provide in their user profile. All users
              can see, edit, or delete their personal information at any time
              (except they cannot change their username). Website administrators
              can also see and edit that information.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What rights you have over your data
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal mb-4">
              Suggested text: If you have an account on this site, or have left
              comments, you can request to receive an exported file of the
              personal data we hold about you, including any data you have
              provided to us. You can also request that we erase any personal
              data we hold about you. This does not include any data we are
              obliged to keep for administrative, legal, or security purposes.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Where your data is sent
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              Suggested text: Visitor comments may be checked through an
              automated spam detection service.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
