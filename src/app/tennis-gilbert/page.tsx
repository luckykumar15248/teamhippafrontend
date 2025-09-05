"use client";

import SportsHeroSection from "../components/SportsHeroSection";
import { Button } from "../components/Button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./styles.css";
import {
  FLEXIBLE_TRAINING,
  GILBERT_FAQS,
  INFO_ITEMS,
  PROGRAMS_MASTER,
  PROGRAMS_TENNIES,
} from "@/untils/constant";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import FAQ from "../components/FAQ";

const TennisGilbert: React.FC = () => {
  const router = useRouter();
  const handleClick = () => {
    router.push("/register");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handelJoinClicked = () => {
    router.push("/course-categories");
  };
  return (
    <>
      <SportsHeroSection
        bgImage="/images/tennis.png"
        title="Team Hippa Tennis Academy coming to Gilbert, AZ"
        description="Personalized Coaching, Classes for Juniors and Adults, Tournaments…all coming soon to Gilbert."
        showCallButton
      />

      {/* <section className="bg-gray-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16 text-center">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-semibold text-left md:text-center text-black mb-4 capitalize">
            Book our Summer camp at teamhippa Academy for your junior!
          </h2>
          <p className="text-base sm:text-lg text-black font-normal mb-3">
            Join us at the Teamhippa Academy for an exceptional tennis training
            experience! Whether you’re an adult or a child, and regardless of
            your current skill level, our camps offer a premier opportunity to
            improve your game.
          </p>
        </div>
      </section> */}
      <section className="relative bg-gradient-to-r from-[#b0db72] to-[#3a702b] py-12 sm:py-16 md:py-20 px-6 lg:px-16 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative max-w-screen-xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 capitalize">
            Book Our Summer Camp At{" "}
            <span className="relative">
              Teamhippa Academy
            </span>
            For Your Junior!
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-white/90 font-light max-w-3xl mx-auto mb-8 leading-relaxed">
            Join us at the Teamhippa Academy for an exceptional tennis training
            experience! Whether you’re an adult or a child, and regardless of
            your current skill level, our camps offer a premier opportunity to
            improve your game.
          </p>

          <div className="flex justify-center">
            <Button
              onClick={handleClick}
              className="bg-white !text-[#64a506] px-6 py-3 !rounded-full font-medium shadow-md hover:shadow-lg hover:bg-gray-100 transition-all duration-300"
            >
              Register Now
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-yellow-100 py-10 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto">
          <div className="w-full flex flex-col md:flex-row items-center gap-8 ">
            <div className="w-full md:w-96">
              <Image
                src="/images/gilbert.jpg"
                alt="eamHippa-logo"
                width={500}
                height={600}
                className="w-full h-[450px] object-fill md:object-contain"
              />
            </div>

            <div className="space-y-4 w-full md:w-[calc(100%-364px)]">
              <h3 className="text-[#8ecf4f] font-semibold text-lg uppercase">
                Youth Summer Camps{" "}
                <span className="text-black">
                  Starting at <strong>$400</strong>
                </span>
              </h3>

              <p className="text-gray-900 font-semibold">
                For all players and levels | For daily drop-in, please contact
                us directly
              </p>

              <h4 className="text-lg font-bold text-gray-900">
                Team Hippa Junior Summer Tennis Camp 2025
              </h4>

              <p className="text-gray-700 leading-relaxed">
                Get ready for an unforgettable summer on the court! At the{" "}
                <span className="font-semibold">
                  Team Hippa Youth Summer Tennis Camp
                </span>
                , players of all levels – from beginners to competitive athletes
                – will receive high-quality tennis instruction, mental coaching,
                and a full day of fun in a dynamic and supportive environment.
              </p>

              <ul className="space-y-2 text-gray-800">
                {INFO_ITEMS.map((item, index) => (
                  <li key={index} className="flex gap-2 items-start sm:items-center">
                    {item.icon}{" "}
                    <span className="font-semibold">{item.label}</span>{" "}
                    {item.text}
                  </li>
                ))}
              </ul>
              <Button className="transition">Read More</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-semibold uppercase text-black">
              New Tennis Program in Gilbert
            </h1>
            <div className="mt-2 h-1 w-20 bg-green-600 mx-auto rounded"></div>
          </div>

          {/* WHO ARE WE */}
          <div className="mb-12 bg-white shadow-md rounded-2xl p-6 md:p-10">
            <h2 className="text-2xl text-green-600 font-semibold uppercase mb-4">
              Who Are We?
            </h2>

            <p className="mb-4 leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              <span className="font-bold">Team Hippa</span> is a high-level
              tennis academy based in{" "}
              <span className="font-bold">Phoenix, Arizona</span>, built by a
              team of certified, internationally experienced coaches. Known for
              our modern training methods and strong European coaching
              philosophy, we’ve helped players of all ages grow their game
              through a balanced focus on technique, fitness, and mental
              strength. After success in the Phoenix area, we’re excited to
              expand into <span className="font-bold">Gilbert</span>, bringing
              our proven programs to
              <span className="font-bold"> Gilbert Regional Park</span> and{" "}
              <span className="font-bold">Freestone Recreation Center</span>.
              Whether you’re just starting out or competing at a high level, our
              mission is to provide the structure, flexibility, and support
              needed to help every player reach their full potential.
            </p>

            <p className="text-base sm:text-lg font-medium text-blue-600 underline cursor-pointer">
              Looking for tennis lessons in Gilbert, Arizona?
            </p>
            <p className="mb-4 leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              Team Hippa is launching soon with exciting new
              <span className="font-bold">tennis programs</span> at
              <span className="font-bold">Gilbert Regional Park</span> and{" "}
              <span className="font-bold">Freestone Recreation Center</span>.
            </p>
            <p className="text-base sm:text-lg text-gray-600 font-normal">
              Our academy offers tennis training for all ages and levels —
              including
              <span className="font-bold"> new tennis programs</span> at Gilbert
              Regional Park and Freestone Recreation Center.
            </p>
          </div>

          {/* Flexible Training */}
          <div className="mb-12 bg-green-50 border-l-4 border-green-600 rounded-md p-6">
            <h2 className="text-2xl text-green-600 font-semibold uppercase mb-4">
              Flexible, Player-Centered Training – No Set Schedules
            </h2>
            <p className="mb-4 leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              Unlike many tennis programs in Gilbert, we don’t lock players into
              rigid 8-week sessions or fixed times. With Team Hippa, you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-600 font-normal">
              {FLEXIBLE_TRAINING.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              This flexible structure is ideal for busy families, students, and
              adult players who want to stay active without the pressure of a
              fixed schedule.
            </p>
          </div>

          {/* Coaching Philosophy */}
          <div className="mb-12 bg-white shadow-md rounded-2xl p-6 md:p-10">
            <h2 className="text-2xl text-green-600 font-semibold uppercase mb-4">
              European Coaching Philosophy, Right Here in Gilbert
            </h2>
            <p className="mb-4 leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              Led by a team of{" "}
              <span className="font-bold">
                highly educated, certified coaches
              </span>
              , Team Hippa brings a{" "}
              <span className="font-bold">European coaching philosophy</span>{" "}
              focused on long-term player development, technical excellence, and
              a positive, competitive environment.
            </p>
            <p className="leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
              Whether you’re picking up a racket for the first time or training
              for your next tournament, our mission is to provide the
              highest-quality tennis instruction in Gilbert.
            </p>
          </div>

          {/* Programs Coming Soon */}
          <div className="bg-green-600 text-white text-base sm:text-lg font-normal rounded-2xl shadow-lg p-6 md:p-10">
            <h2 className="text-2xl font-semibold uppercase mb-4">
              Programs Coming Soon
            </h2>
            <ul className="list-disc list-inside space-y-2">
              {PROGRAMS_TENNIES.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-gray-100">
        <div className="max-w-screen-2xl mx-auto">
          <h3 className="text-4xl sm:text-5xl font-semibold text-center text-black mb-2">
            Master Your Game, Your Way
          </h3>
          <p className="mb-6 leading-relaxed text-base sm:text-lg text-gray-600 text-center font-normal">
            From Beginners to Pros, We Have the Perfect Tennis Coaching for
            Every Level and Goal!
          </p>
          <Swiper
            slidesPerView={1.2}
            spaceBetween={16}
            loop={true}
            navigation={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: { slidesPerView: 2.5 },
              768: { slidesPerView: 2.5 },
              1024: { slidesPerView: 3.5 },
              1280: { slidesPerView: 3.5 },
            }}
            modules={[Navigation, Autoplay]}
            className="w-full custome-slide"
          >
            {PROGRAMS_MASTER.map((program) => (
              <SwiperSlide key={program.title}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                  <Image
                    src={program.img}
                    alt={program.title}
                    width={400}
                    height={300}
                    className="w-full h-52 object-cover rounded-t-xl"
                  />
                  <div className="p-4">
                    <h4 className="text-base font-semibold text-black line-clamp-1">
                      {program.title}
                    </h4>
                    <p className="text-base sm:text-lg text-gray-600 font-normal line-clamp-2 mt-1">
                      {program.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
      <section className="relative w-full h-96 bg-gray-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16 bg-[url('/images/exclusive-deal.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/30 z-0" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <p className="text-base sm:text-lg font-bold text-[#b0db72] mb-3">
            Join us
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-4">
            Our Tennis Partner Program is always open for you to join.
          </h2>
          <Button
            onClick={handelJoinClicked}
            className="text-white px-4 py-2 rounded w-fit text-sm font-normal"
          >
            Book A Lession
          </Button>
        </div>
      </section>
      <FAQ
        title="The fastest growing Tennis Academy"
        subtitle="Feel free to ping us incase there is any doubts you have. Our team will love to help you out."
        data={GILBERT_FAQS}
      />
      {/* <section className="bg-green-100 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-green-700 font-bold uppercase text-lg mb-3">
              Why the European Coaching Philosophy Builds Champions
            </h2>
            <p className="text-gray-700 font-semibold mb-4">
              Europe has produced some of the best tennis players on the plant. But what differs european tennis from american?
            </p>

            <p className="text-gray-700 mb-4 leading-relaxed">
              Regarding producing world-class tennis players, Europe has consistently led the way. From Rafael Nadal to Novak Djokovic, the continent has developed elite athletes known for their technical precision, mental toughness, and strategic play. But what exactly makes the European tennis coaching philosophy so effective — and why are we bringing it to our new tennis academy in Gilbert, Arizona?
            </p>

            <p className="text-gray-700 mb-4 leading-relaxed">
              At its core, European coaching emphasizes long-term player development over short-term results. Instead of pushing players into early competition, coaches focus on foundational skills — footwork, consistency, shot selection — and gradually build from there. One of the defining characteristics of this approach is the strong coach-player relationship, often formed by working with one dedicated coach over multiple years. This continuity allows coaches to deeply understand each athlete’s needs and guide their progression with precision. The outcome? Technically sound, mentally prepared players who thrive at high-performance levels.
            </p>

            <p className="text-gray-700 mb-4 leading-relaxed">
              Another hallmark of European-style junior tennis training is a structured but flexible training model. Group sizes tend to be smaller, allowing for individualized attention, and coaches act as long-term mentors, not just instructors. At our tennis academy in Gilbert, we embrace this mindset by designing sessions based on a player’s age, experience, and goals. Rather than rigid schedules, we offer flexible training packages so athletes — and parents — can choose when and how often to train. This freedom supports consistency and avoids burnout, especially for busy families.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Mental development is equally important. The European coaching model emphasizes emotional maturity, focus, and internal motivation. Through match-style drills, guided pressure situations, and strategic game play, players build the skills needed to compete confidently and independently. It’s an approach that develops not only great players, but strong individuals.
            </p>
            <p className="text-gray-700 leading-relaxed">
                At Team Hippa, we bring this proven system to our high-performance tennis programs in Arizona. With deep roots in European methodology and years of experience in junior tennis development, our mission is to offer players the tools, environment, and coaching they need to reach their full potential. Just as importantly, we’re creating a family-oriented, competitive atmosphere where both players and parents feel they’re part of something meaningful. That’s why we chose the name Team Hippa — because growth happens best when it’s shared.
            </p>
          </div>

          <div className="flex justify-center">
            <Image
              src="/images/tennis-journey.jpeg"
              alt="Coach Training"
              width={500}
              height={600}
              className="rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </section> */}
      <section className="bg-gradient-to-b from-green-50 via-white to-green-100 py-4 sm:py-8 md:py-12 px-6 lg:px-16">
        <div className="max-w-screen-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-green-800 leading-snug">
            Why the{" "}
            <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              European Coaching Philosophy
            </span>{" "}
            Builds Champions
          </h2>
          <p className="mt-4 text-lg text-gray-700 font-semibold max-w-3xl mx-auto">
            Europe has produced some of the best tennis players on the plant.
            But what differs european tennis from american?
          </p>
        </div>

        {/* Content */}
        <div className="mt-12 space-y-8 leading-relaxed text-base sm:text-lg text-gray-600 font-normal">
          <p>
            Regarding producing world-class tennis players, Europe has
            consistently led the way. From Rafael Nadal to Novak Djokovic, the
            continent has developed elite athletes known for their technical
            precision, mental toughness, and strategic play. But what exactly
            makes the{" "}
            <span className="font-semibol">
              European tennis coaching philosophy
            </span>{" "}
            so effective — and why are we bringing it to our new{" "}
            <span className="font-semibold">
              tennis academy in Gilbert, Arizona?
            </span>
          </p>

          <p>
            At its core, European coaching emphasizes <span className="font-semibold">long-term player
            development over short-term results </span>. Instead of pushing players into
            early competition, coaches focus on foundational skills — footwork,
            consistency, shot selection — and gradually build from there. One of
            the defining characteristics of this approach is the <span className="font-semibold">strong
            coach-player relationship </span>, often formed by working with <span className="font-semibold">one
            dedicated coach </span>over multiple years. This continuity allows coaches
            to deeply understand each athlete’s needs and guide their
            progression with precision. The outcome? Technically sound, mentally
            prepared players who thrive at high-performance levels.{" "}
          </p>

          <p>
            Another hallmark of <span className="font-semibold">European-style junior tennis training</span> is a
            structured but flexible training model. Group sizes tend to be
            smaller, allowing for individualized attention, and coaches act as
            long-term mentors, not just instructors. At our <span className="font-semibold">tennis academy in
            Gilbert</span>, we embrace this mindset by designing sessions based on a
            player’s age, experience, and goals. Rather than rigid schedules, we
            offer flexible training packages so athletes — and parents — can
            choose when and how often to train. This freedom supports
            consistency and avoids burnout, especially for busy families.
          </p>

          <p>
            Mental development is equally important. The <span className="font-semibold">European coaching model </span>
            emphasizes emotional maturity, focus, and internal motivation.
            Through match-style drills, guided pressure situations, and
            strategic game play, players build the skills needed to compete
            confidently and independently. It’s an approach that develops not
            only great players, but strong individuals.
          </p>

          <p>
            At <span className="font-semibold">Team Hippa</span>, we
            bring this proven system to our high-performance tennis programs in
            Arizona. With deep roots in European methodology and years of
            experience in junior tennis development, our mission is to offer
            players the tools, environment, and coaching they need to reach
            their full potential. Just as importantly, we’re creating a
            family-oriented, competitive atmosphere where both players and
            parents feel they’re part of something meaningful. That’s why we
            chose the name Team Hippa — because growth happens best when it’s
            shared.
          </p>
        </div>
      </section>
    </>
  );
};

export default TennisGilbert;
