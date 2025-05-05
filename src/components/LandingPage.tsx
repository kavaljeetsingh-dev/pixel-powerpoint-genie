import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  FileIcon,
  ImageIcon,
  LayoutIcon,
  MessageSquareIcon,
  PresentationIcon,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: false, amount: 0.3 });

  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: false, amount: 0.3 });

  const foundersRef = useRef<HTMLDivElement>(null);
  const foundersInView = useInView(foundersRef, { once: false, amount: 0.3 });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const features = [
    {
      icon: <MessageSquareIcon size={36} className="text-indigo-500" />,
      title: "Chatbot Interface",
      description: "Describe your presentation topic to our AI and get personalized content."
    },
    {
      icon: <FileIcon size={36} className="text-violet-500" />,
      title: "Custom Slides",
      description: "Choose how many slides you need, from 4 to 10, to match your presentation length."
    },
    {
      icon: <ImageIcon size={36} className="text-purple-500" />,
      title: "AI-Generated Images",
      description: "Our AI will create relevant visuals that enhance your presentation content."
    },
    {
      icon: <LayoutIcon size={36} className="text-fuchsia-500" />,
      title: "Beautiful Themes",
      description: "Choose between light and dark themes to match your presentation style."
    },
    {
      icon: <PresentationIcon size={36} className="text-pink-500" />,
      title: "Export to PPT",
      description: "Download your presentation as a PowerPoint file ready to use."
    }
  ];

  const founders = [
    {
      name: "Sanskar Dubey",
      role: "Founder and Director",
      image: "https://i.ibb.co/rfNgMTKQ/sanskar.jpg",
      description: "MediaWiki Open source Contributor, MERN Stack developer, AI Engineer",
      tags: ["MERN Stack", "AI", "Open Source"]
    },
    {
      name: "Mohd Zaid Sayyed",
      role: "Co-founder and Managing Director",
      image: "https://i.ibb.co/KpbxmG3X/zaid.jpg",
      description: "@GDG Prayagraj | Hackathons Winner | App Developer (Flutter/Dart)",
      tags: ["Flutter", "Dart", "Mobile Development"]
    },
    {
      name: "Shiva Pandey",
      role: "Chief Operating Officer (COO)",
      image: "https://i.ibb.co/zP3N1pY/shiva.jpg",
      description: "Next Js Web developer || Python (Gen AI / ML / Deep Learning) || Hackathon Winner",
      tags: ["Next.js", "Python", "AI/ML"]
    },
    {
      name: "Devendra Singh",
      role: "Chief Technology Officer",
      image: "https://i.ibb.co/LCxYr1m/devendra.jpg",
      description: "Full Stack Web Developer || Python & ML enthusiast || GSSoC'24 || Building Scalable Web Projects",
      tags: ["Full Stack", "Python", "ML"]
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      {/* [Unchanged Hero Section Code Here - omitted for brevity] */}
      
      {/* Features Section */}
      {/* [Unchanged Features Section Code Here - omitted for brevity] */}

      {/* Founders Section */}
      <motion.div
        ref={foundersRef}
        className="py-24 bg-gradient-to-b from-background to-background/80"
        variants={staggerContainerVariants}
        initial="hidden"
        animate={foundersInView ? "visible" : "hidden"}
      >
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            Meet Our Team
          </motion.h2>

          <motion.p
            className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            The brilliant minds behind Pixel PowerPoint Genie
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4 relative">
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src={founder.image} alt={founder.name} />
                    <AvatarFallback>{founder.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <motion.div
                    className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Users size={18} />
                  </motion.div>
                </div>
                <h3 className="text-xl font-semibold mb-1">{founder.name}</h3>
                <p className="text-muted-foreground mb-1">{founder.role}</p>
                <p className="text-sm text-muted-foreground mb-2">{founder.description}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {founder.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div className="mt-16 text-center" variants={itemVariants}>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-medium"
            >
              Create Your Presentation Now
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
