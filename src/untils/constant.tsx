import {
  AwardIcon,
  CarFacilityIcon,
  ExpertIcon,
  FacebookIcon,
  FitnessIcon,
  InstaIcon,
  LocationIcon,
  LunchIcon,
  TimeIcon,
  TrophyIcon,
} from "@/app/components/Icons";


export const NAV_LINKS = [
  { href: "/book-now", label: "Book Now" },
  { href: "/sports/tennis", label: "Tennis" },
  //{ href: "/sports/pickleball", label: "Pickleball" },
  { href: "/packages", label: "Packages" },
  { href: "/gallery", label: "Gallery" },
   { href: "/blog", label: "Blog" },
   { href: "/tournaments", label: "Tournaments" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export const FOOTER_NAV = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/faq", label: "FAQ" },
];

export const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/people/Team-Hippa/",
    icon: <FacebookIcon className="text-black hover:text-[#b0db72]" />,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/teamhippa_az/",
    icon: <InstaIcon className="text-black hover:text-[#b0db72]" />,
  },
];

export const SLIDES_IMG = [
  
  {
    image: "/images/tennis-winter-camp.jpg",
    heading: "UPCOMING Winter Tennis Camp 2025",
    subtext: "Find the best Winter Tennis Camp 2025 in the USA 2025.",
    buttonText: "View Details",
    url : "https://teamhippa.com/winter-camp",
  },
  {
    image: "/images/junior-summer.jpeg",
    heading: "UPCOMING Youth Summer Tennis Camp 2026",
    subtext: "Find the best summer camps in the USA 2026.",
    buttonText: "View Details",
    url : "https://teamhippa.com/summer-camp",
  },
  {
    image: "/images/pickleball.png",
    heading: "Team Hippa Goes Pickleball!",
    subtext: "Structured. Social. Serious Fun.",
    buttonText: "Book Now",
  },

  {
    image: "/images/junior-tennis.png",
    heading: "Master junior tennis: expert lessons & training",
    subtext:  "Help your child master their game with expert junior tennis lessons and training designed for all skill levels.",
    buttonText: "Book Now",
  },
  {
    image: "/images/adult-tennis.png",
    heading: "Adult Tennis Lessons",
    subtext: "For beginners and returning players alike.",
    buttonText: "Book Now",
  },
];

export const ABOUT_FAQS = [
  {
    question: "What age groups do you cater to?",
    answer:
      "We offer programs for all ages! Our Junior Tennis Classes are perfect for kids as young as 5, while our Adult Tennis Lessons welcome players of all skill levels.",
  },
  {
    question: "Do I need to bring my own equipment?",
    answer:
      "If you have your own racket, great! If not, let us know, we may be able to provide you one.",
  },
  {
    question: "How long are the lessons and training sessions?",
    answer:
      "Most of our lessons and classes are 1 hour long, with certain classes being up to 2h.",
  },
  {
    question: "Are the classes suitable for beginners?",
    answer:
      "Absolutely! Our coaches work with players of all skill levels, and we have beginner-friendly classes to help you build confidence and learn the basics.",
  },
  {
    question: "Can I schedule private lessons at a time that suits me?",
    answer:
      "Yes! Private instruction is flexible, and we’ll work with you to find a schedule that fits your availability.",
  },
];

export const TENNIS_PAGE_FAQS = [
  {
    question: "Do you offer tennis lessons for beginners?",
    answer: "Yes, our tennis academy offers beginner-friendly programs for juniors and adults in Gilbert and Phoenix."
  },
  {
    question: "Where is your tennis academy located?",
    answer: "We operate professional tennis training centers in both Phoenix and Gilbert, Arizona."
  },
  {
    question: "Do you provide adult tennis coaching?",
    answer: "Yes, we offer adult tennis lessons ranging from beginner to competitive-level training."
  },
  {
    question: "How can I book tennis classes?",
    answer: "You can book directly online through our website or contact our team for class recommendations."
  }
];


export const SERVICES = [
  "Junior Tennis Classes",
  "Adult Tennis Lessons",
  "High-Performance Coaching",
  "Private Instruction",
];

export const LIST_ITEMS = [
  "Skill-level based progression",
  "Consistency in coaching & scheduling",
  "Focus on long-term player growth",
  "Mentorship, tracking, and match-play integration",
  "Personalized training schedules for ideal development",
];

export const OFFER_ITEMS = [
  {
    title: "Group Classes",
    description: "Beginner to advanced drills, strategy, footwork",
  },
  {
    title: "Private & Semi-Private Instruction",
    description: "Tailored to your goals",
  },
  {
    title: "Youth Development Program",
    description: "Skill-building with fun and structure",
  },
  {
    title: "Organized Match Play",
    description: "Compete weekly and track progress",
  },
  {
    title: "Social Events",
    description: "Mixers, “Play & Pizza” nights, and community tournaments",
  },
];
export const INSTRUCTION_ITEMS = [
  "Learn correct technique early (and avoid bad habits)",
  "Reduce risk of injury (improve footwork, swing mechanics, recovery)",
  "Build confidence on the court",
  "Play longer, harder, and smarter",
  "Unlock your competitive edge (or just have more fun!)",
];
export const CHOICE_ITEMS = [
  "Elite local coaches",
  "A strong academy culture",
  "Proven experience building community",
  "A vision for growing the sport locally and nationally through our very own software and online-presence",
];
export const PHOENIX_JUNIOR_FAQS = [
  {
    question: "What should my child bring to their first tennis lesson?",
    answer:
      "For the first class, bring comfortable athletic clothing, tennis shoes, a water bottle, and sunscreen. We provide racquets and tennis balls for beginner classes, so no need to buy equipment right away. Our coaches can also help recommend the right racquet size once your child joins."
  },
  {
    question: "How do I know which junior tennis program is right for my child?",
    answer:
      "We recommend starting with a free trial class, where our coaches can assess your child's skill level and suggest the perfect program. Age and experience are both considered when placing players into the right group."
  },
  {
    question: "Do you offer private or semi-private tennis lessons for kids?",
    answer:
      "Yes! We offer both private and semi-private junior tennis lessons for players seeking individualized attention or faster skill development. These can complement our group programs or be taken on their own."
  },
  {
    question: "What is your class cancellation or rescheduling policy?",
    answer:
      "We offer flexible rescheduling with at least 24-hour notice. For monthly programs, make-up classes are available if your child misses a session due to illness, travel, or other conflicts."
  },
  {
    question: "What happens in case of rain or extreme heat in Phoenix?",
    answer:
      "Your child's safety is our top priority. We monitor weather closely—if classes need to be canceled due to rain or extreme heat, we’ll notify families at least one hour in advance via email and our app. At Rose Mofford, we also have access to indoor facilities, and make-up sessions or credits will be arranged."
  },
  {
    question: "My child is a complete beginner. Which class should we choose?",
    answer:
      "Our 'Tots (Ages 4–6)' and 'Beginners (Ages 7–10)' programs are ideal for new players. They focus on fun, coordination, and basic tennis skills, helping your child build confidence and enjoy the game from day one."
  },
  {
    question: "What is the coach-to-player ratio in your junior classes?",
    answer:
      "We keep classes small to ensure quality instruction and personalized feedback. Our junior programs typically maintain a 1:4–6 coach-to-player ratio, so every child receives the attention they need to improve."
  },
  {
    question: "Do you offer competitive or advanced junior tennis programs?",
    answer:
      "Yes, we have advanced and pre-competitive junior programs for players who are ready to take their skills to the next level. These focus on match play, strategy, and tournament preparation under professional guidance."
  },
  {
    question: "Where are your junior tennis lessons held in Phoenix?",
    answer:
      "Most of our junior programs take place at the Rose Mofford Sports Complex and nearby partner courts in Phoenix. Specific location details will be shared upon registration."
  }
];

export const ARIZONA_TENNIS_ACADEMY = [
  {
    question: "What locations in Arizona do you serve?",
    answer:
      "Our primary training facilities are conveniently located to serve players throughout the Valley, with a focus on Phoenix and Gilbert. We welcome players from neighboring communities, including Chandler, Mesa, and Scottsdale.",
  },
  {
    question: "Can I take both tennis and pickleball lessons at Team Hippa?",
    answer:
      "Absolutely! We are one of the few academies in Arizona that specializes in both sports. Many of our players enjoy training in both, as the skills are complementary. Switching between tennis and pickleball is a great way to improve your overall racquet skills and have more fun on the court.",
  },
  {
    question: "What is your policy for bad weather, like extreme heat or rain?",
    answer:
      "Your safety is our priority. In cases of extreme heat, rain, or other unsafe weather conditions, we will cancel the session and notify you as early as possible. We will then work with you to schedule a make-up class at a convenient time.",
  },
  {
    question: "What types of tennis lessons are available in Gilbert?",
    answer:
      "Team Hippa offers extensive group programs, private lessons, semi-private, as well as focused hitting sessions. We cater to all ages (kids, teens, adults, seniors) and skill levels (beginner, intermediate, advanced).",
  },
  {
    question: "How do I know which group/level to attend?",
    answer:
      "You can contact us directly and we'll help to match you with the right group, based on your experience.",
  },
  {
    question:
      "Are there options for kids and junior tennis lessons in Gilbert?",
    answer:
      "Yes, all of our coaches are specialists in guiding players through every stage of their development. Whether you're fine-tuning your technique or advancing your tactical play, our certified coaches apply proven European coaching methods—right here in Gilbert.",
  }
  
];

export const PICKLEBALL_FAQS = [
  {
    question: " What is Pickleball?",
    answer:
      "A fun paddle sport combining tennis, badminton, and table tennis, played with a plastic ball and paddles on a small court.",
  },
  {
    question: "How do you score points in Pickleball?",
    answer:
      " Only the serving team can score. You earn a point if the opponent commits a fault during a rally.",
  },
  {
    question: "What is the “kitchen” in Pickleball?",
    answer:
      " It’s a 7-foot non-volley zone near the net. You can’t volley the ball while standing in this area.",
  },
  {
    question: "Can beginners play Pickleball?",
    answer:
      "Absolutely! It’s easy to learn, and many clubs offer beginner lessons or open play sessions.",
  },
  {
    question: "Can I schedule private lessons at a time that suits me?",
    answer:
      "Yes! Private instruction is flexible, and we’ll work with you to find a schedule that fits your availability.",
  },
];

export const PROGRAMS = [
 
  {
    title: "Junior Tennis Classes",
    img: "/images/junior.jpg",
    description:
      "Fun, engaging lessons for young players! Build strong foundations, make friends, and spark a lifelong love for tennis with us.",
  },
  {
    title: "Adult Tennis Lessons",
    img: "/images/adult.jpg",
    description:
      "Stay active and improve your game! Tailored lessons help you master techniques, build confidence, and enjoy every moment on the court.",
  },
  {
    title: "High-Performance Coaching",
    img: "/images/high-performance.jpg",
    description:
      "Push your limits with advanced drills and strategies. Designed for competitive players who are serious about taking their game further.",
  },
  {
    title: "Private Instruction",
    img: "/images/instruction.jpg",
    description:
      "Achieve your goals faster with personalized coaching. One-on-one sessions ensure focused training tailored to your unique strengths and needs.",
  },
];

export const COACH_LIST = [
  {
    name: "Rick Macci ",
    role: "Senior Coach",
    img: "/images/coaching.jpeg",
  },
  {
    name: "Nick Bollettieri",
    role: "Junior Development",
    img: "/images/coaching.jpeg",
  },
  {
    name: "Patrick McEnroe",
    role: "Fitness Coach",
    img: "/images/coaching.jpeg",
  },
];

export const CAMP_DETAILS = [
  {
    title: "Explore Top-Rated Tennis Camps for All Ages",
    description:
      "Whether you’re a beginner or an aspiring pro, tennis camps offer the ideal environment to learn, train, and compete. These camps cater to all ages and skill levels, offering personalized coaching, technique development, and match play strategies. From daily drills to advanced fitness routines, tennis camps provide a structured, energetic setting led by certified instructors. Join a camp that balances competitive training with fun and community, helping you or your child build confidence and skill on the court.",
  },
  {
    title: "Discover the Best Tennis Camps in the USA",
    description:
      "Looking for the highest-rated tennis camps? The best tennis camps combine world-class coaching with modern facilities, small group sessions, and personalized attention. Ideal for youth, adults, and competitive players, these programs focus on technical improvement, mental toughness, and match experience. With flexible schedules and locations across the country, the best camps are tailored to your goals—whether it’s mastering your serve, improving footwork, or preparing for tournaments. Join a top-tier program that delivers results and fosters your passion for the game.",
  },
  {
    title: "Adult Tennis Camps to Boost Your Game",
    description:
      "Adult tennis camps are perfect for players of all experience levels who want to refine their technique, stay active, and enjoy the game. These camps offer a mix of instruction, drills, match play, and social events—creating a supportive and energizing environment. Led by experienced coaches, adult camps cover fundamentals and advanced skills like net play, doubles strategy, and court positioning. Whether you’re a weekend warrior or returning to the game after years, these camps provide the boost you need.",
  },
  {
    title: "Fun & Engaging Kids Tennis Camps Near You",
    description:
      "Kids tennis camps are designed to make learning tennis fun and interactive. Through age-appropriate drills, games, and activities, children develop coordination, teamwork, and a love for the sport. Camps typically group children by age and skill level, ensuring personalized instruction and a safe, encouraging atmosphere. From absolute beginners to junior competitors, kids can build their skills while forming friendships and staying active. Certified coaches focus on both technique and character development to support each child’s growth.",
  },
  {
    title: "Premier Tennis Summer Camps for All Ages",
    description:
      "Make the most of summer with dynamic tennis camps that blend skill-building with summer fun. These programs offer structured training sessions, fitness routines, and exciting match play opportunities for kids, teens, and adults. Whether it’s a day camp or an overnight program, tennis summer camps promote growth on and off the court. You’ll benefit from expert instruction, meet new friends, and enjoy outdoor activities that make every day memorable. Perfect for beginners and seasoned players alike.",
  },
  {
    title: "Find Tennis Summer Camps Near You",
    description:
      "Looking for a tennis summer camp nearby? Local camps provide convenient access to professional coaching, structured programs, and fun-filled tennis activities. With flexible schedules and locations close to home, it’s easy to enroll your child or yourself in a program that suits your goals. These camps focus on improving technique, confidence, and match experience through drills, games and social interaction. Whether it’s a week-long program or full-season training, there’s a tennis summer camp near you waiting to be explored.",
  },
  {
    title: "High-Performance Junior Tennis Camps",
    description:
      "Junior tennis camps are designed for young athletes who are serious about developing their game. With a strong focus on performance, these camps offer elite training environments, low coach-to-player ratios, and daily routines that cover everything from stroke mechanics to mental preparation. Campers are often grouped by ability for targeted development and match play. Whether preparing for high school, college, or tournament play, junior tennis camps provide the structure, feedback, and support young players need to excel on the court.",
  },
];

export const INFO_ITEMS = [
  {
    icon: <LocationIcon className="text-green-700" />,
    label: "Location:",
    text: "Gilbert Regional Park, AZ | Freestone Rec Center Gilbert, AZ",
  },
  {
    icon: <TimeIcon className="text-green-700" />,
    label: "Time:",
    text: "8:00 AM – 1:00 PM (Monday–Friday)",
  },
  {
    icon: <LunchIcon className="text-green-700" />,
    label: "Lunch included daily",
    text: "",
  },
  {
    icon: <CarFacilityIcon className="text-green-700" />,
    label: "Shuttles from select locations in Scottsdale, PV and Phoenix",
    text: "",
  },
];

export const PROGRAMS_TENNIES = [
  "Tennis programs for adults and juniors of all levels",
  "Social clinics",
  "High-performance training for competitive youth",
  "Private and semi-private tennis lessons",
  "Pickleball classes and open play",
  "Tournaments and Match-Play opportunities",
];

export const FLEXIBLE_TRAINING = [
  "Purchase class packages at a discounted rate",
  "Use class credits to book sessions on your own schedule",
  "Train when it works for you, without sacrificing consistency",
];

export const PROGRAMS_MASTER = [
  {
    title: "Tennis Coach",
    img: "/images/tennis-journey.jpeg",
    description:
      "Unlock your potential with expert guidance. Our professional trainers will refine your skills and elevate your game to new heights.",
  },
  {
    title: "Junior Tennis Classes",
    img: "/images/junior.jpg",
    description:
      "						Stay active and improve your game! Tailored lessons help you master techniques, build confidence, and enjoy every moment on the court.",
  },
  {
    title: "Adult Tennis Lessons",
    img: "/images/adult.jpg",
    description:
      "						Stay active and improve your game! Tailored lessons help you master techniques, build confidence, and enjoy every moment on the court.",
  },
  {
    title: "High-Performance Coaching",
    img: "/images/high-performance.jpg",
    description:
      "Push your limits with advanced drills and strategies. Designed for competitive players who are serious about taking their game further.",
  },
  {
    title: "Private Instruction",
    img: "/images/instruction.jpg",
    description:
      "Achieve your goals faster with personalized coaching. One-on-one sessions ensure focused training tailored to your unique strengths and needs.",
  },
];

export const PHOENIX_FAQS = [
  {
    question: "Where can I find tennis lessons in Phoenix, Arizona?",
    answer:
      "Team Hippa offers a variety of classes and programs at Phoenix Regional Park, designed for all ages and skill levels. For those seeking more personalized guidance, our coaches also provide private and semi-private sessions tailored to individual needs.",
  },
  {
    question: "What types of tennis lessons are available in Phoenix?",
    answer:
      "Team Hippa offers extensive group programs, private lessons, semi-private, as well as focused hitting sessions. We cater to all ages (kids, teens, adults, seniors) and skill levels (beginner, intermediate, advanced).",
  },
  {
    question: "How do I know which group/level to attend?",
    answer:
      "You can contact us directly and we'll help to match you with the right group, based on your experience.",
  },
  {
    question:
      "Are there options for kids and junior tennis lessons in Phoenix?",
    answer:
      "Yes, all of our coaches are specialists in guiding players through every stage of their development. Whether you're fine-tuning your technique or advancing your tactical play, our certified coaches apply proven European coaching methods—right here in Gilbert.",
  },
];

export const GILBERT_FAQS = [
  {
    question: "Where can I find tennis lessons in Gilbert, Arizona?",
    answer:
      "Team Hippa offers a variety of classes and programs at Gilbert Regional Park, designed for all ages and skill levels. For those seeking more personalized guidance, our coaches also provide private and semi-private sessions tailored to individual needs.",
  },
  {
    question: "What types of tennis lessons are available in Gilbert?",
    answer:
      "Team Hippa offers extensive group programs, private lessons, semi-private, as well as focused hitting sessions. We cater to all ages (kids, teens, adults, seniors) and skill levels (beginner, intermediate, advanced).",
  },
  {
    question: "How do I know which group/level to attend?",
    answer:
      "You can contact us directly and we'll help to match you with the right group, based on your experience.",
  },
  {
    question:
      "Are there options for kids and junior tennis lessons in Gilbert?",
    answer:
      "Yes, all of our coaches are specialists in guiding players through every stage of their development. Whether you're fine-tuning your technique or advancing your tactical play, our certified coaches apply proven European coaching methods—right here in Gilbert.",
  },
];

export const WINTER_CAMP_FAQS = [
  {
    question: "What is the Winter Tennis Camp all about?",
    answer:
      "Our Winter Tennis Camp is a 2-week intensive program designed to help players improve their skills, fitness, and confidence on the court while enjoying fun winter activities.",
  },
  {
    question: "Who can join the Winter Tennis Camp?",
    answer:
      "The camp is open to juniors of all ages and skill levels – Whether you are a beginner, experienced, or advanced player, everyone is are all welcome.",
  },
  {
    question: "Where will the camp take place?",
    answer:
      "The camp will be held at the Freestone Rec Center in Gilbert, AZ. Besides the tennis courts, we have access to an entire indoor facility featuring a Gym, climbing wall, pool tables, break rooms, and more. Perfect for kids to enjoy their time, even during lunch break.",
  },
  {
    question: "What are the dates for the camp?",
    answer:
      "The Winter Camp runs in two separate weeks from Dec 22 - 24th (3 days), and Dec 29 - Jan 2 (excl. Jan 1)(4 days)",
  },
  {
    question: "What is included in the camp fee?",
    answer:   "The fee covers tennis training, fitness training, lunch and access to the Rec center.",
  },
  {
    question: "How do I register for the camp?",
    answer:    "You can register directly on our website by clicking the 'Register Now' button or by contacting our academy via phone/email.",
  },
  {
 question: "Is a daily drop-in possible?",
 answer: "Yes. For daily drop-ins, please contact us directly to sign up for your requested dates.",
  },
  {
 question: "Will there be transportation?",
 answer: "Transportation will be offered for a surcharge for select locations in Phoenix and Scottsdale. To book transportation, please select it during the checkout process.",
  },
];

export const SUMMER_CAMP_FAQS = [
  {
    question: "What is the Summer Tennis Camp all about?",
    answer:
      "Our Summer Tennis Camp is a 2-week intensive program designed to help players improve their skills, fitness, and confidence on the court while enjoying fun winter activities.",
  },
  {
    question: "Who can join the Summer Tennis Camp?",
    answer:
      "The camp is open to players of all ages and skill levels – kids, teens, and adults. Beginners, intermediate, and advanced players are all welcome.",
  },
  {
    question: "Where will the camp take place?",
    answer:
      "The camp will be held at City Tennis Academy, New Delhi, with world-class facilities including multiple courts, fitness areas, and a recreational lounge.",
  },
  {
    question: "What are the dates for the camp?",
    answer:
      "The Summer Camp runs from December 15th to December 30th, 2025. You can choose full camp participation or join on selected days.",
  },
  {
    question: "What is included in the camp fee?",
    answer:
      "The fee covers professional coaching, fitness training, match play, fun activities, camp t-shirt, and refreshments. Accommodation and meals are available as add-ons.",
  },
  {
    question: "How do I register for the camp?",
    answer:
      "You can register directly on our website by clicking the 'Register Now' button or by contacting our academy via phone/email. Early bird discounts are available for advance bookings.",
  },
  {
    question: "Do you offer private lessons during the camp?",
    answer:
      "Yes, players can book additional private or semi-private lessons with our coaches during the camp for more focused training.",
  },
];




export const SCHEDULE = [
  {
    time: "9:00 AM",
    title: "Warm Up and Tennis Training",
    desc: "Focus on Drills, Technique, and Strategy",
    icon: "🏃",
  },
  {
    time: "10:30 AM",
    title: "Fitness",
    desc: "We utilize an indoor gym and provide a tailored Fitness program for each player",
    icon: "🎾",
  },
  {
    time: "11:30 AM",
    title: "Lunch Break",
    desc: "Included in Camp Fee",
    icon: "🏆",
  },
  {
    time: "12:30 PM",
    title: "Match play and Competition",
    desc: "Players will compete against each other, with a tournament at the end of the week with prizes.",
    icon: "🌅",
  },
  {
    time: "2:00 PM",
    title: "Cooldown and Pick-Up",
    desc: "Transportation Available both ways from Scottsdale, Phoenix and PV (Surcharge)",
    icon: "🌅",
  },
];
export const CAMP_FEATURES = [
  {
    icon: <ExpertIcon />,
    title: "Expert Coaches",
    desc: "Learn from certified, experienced trainers.",
  },
  {
    icon: <FitnessIcon />,
    title: "Fitness Training",
    desc: "Special drills to improve stamina & agility.",
  },
  {
    icon: <TrophyIcon />,
    title: "Match Play",
    desc: "Daily matches to sharpen competitive skills.",
  },
  {
    icon: <AwardIcon />,
    title: "Fun & Awards",
    desc: "Trophies, medals & a fun closing ceremony.",
  },
];

export const PHOENIX_COURSES = [
  {
    id: 27,
    title: "Junior Beginners | Phoenix",
    description: "Start from the basics and learn the game.",
    ageRange: "Up to 18",
    image: "/images/tennis-journey.jpeg",
    courseURL: "/book-now/courses/junior-beginners-phoenix",
  },
  // ...other courses
];

