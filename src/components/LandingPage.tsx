import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowDownIcon, ArrowRightIcon, FileIcon, ImageIcon, LayoutIcon, MessageSquareIcon, PresentationIcon, Users } from "lucide-react";
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
  
  // Parallax effect for the hero section
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  // Animation variants
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

  // Features data
  const features = [
    { icon: <MessageSquareIcon size={36} className="text-indigo-500" />, title: "Chatbot Interface", description: "Describe your presentation topic to our AI and get personalized content." },
    { icon: <FileIcon size={36} className="text-violet-500" />, title: "Custom Slides", description: "Choose how many slides you need, from 4 to 10, to match your presentation length." },
    { icon: <ImageIcon size={36} className="text-purple-500" />, title: "AI-Generated Images", description: "Our AI will create relevant visuals that enhance your presentation content." },
    { icon: <LayoutIcon size={36} className="text-fuchsia-500" />, title: "Beautiful Themes", description: "Choose between light and dark themes to match your presentation style." },
    { icon: <PresentationIcon size={36} className="text-pink-500" />, title: "Export to PPT", description: "Download your presentation as a PowerPoint file ready to use." }
  ];

  // Founders data
  const founders = [
    { name: "Sanskar Dubey", role: "Founder and Director", description: "MediaWiki Open source Contributor, MERN Stack developer, AI Engineer", image: "https://i.ibb.co/rfNgMTKQ/sanskar.jpg", skills: ["MERN Stack", "AI", "Open Source"] },
    { name: "Mohd Zaid Sayyed", role: "Co-founder and Managing Director", description: "@GDG Prayagraj | Hackathons Winner | App Developer (Flutter/Dart)", image: "https://i.ibb.co/KpbxmG3X/zaid.jpg", skills: ["Flutter", "Dart", "Mobile Development"] },
    { name: "Shiva Pandey", role: "Chief Operating Officer (COO)", description: "Next Js Web developer || Python (Gen AI / ML / Deep Learning) || Hackathon Winner", image: "https://i.ibb.co/9kJL6FqV/shiva.jpg", skills: ["Next.js", "Python", "AI/ML"] },
    { name: "Devendra Singh", role: "Chief Technology Officer", description: "Full Stack Web Developer || Python & ML enthusiast || GSSoC'24 || Building Scalable Web Projects", image: "https://i.ibb.co/MDYttnhr/dev.jpg", skills: ["Full Stack", "Python", "ML"] }
  ];

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <motion.div ref={heroRef} className="min-h-screen hero-gradient flex flex-col items-center justify-center px-4 text-white relative overflow-hidden" style={{ y: heroY, opacity: heroOpacity }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 filter blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-purple-500/10 filter blur-3xl" />
        </div>
        <motion.div className="max-w-3xl mx-auto text-center z-10" initial={{ opacity: 0, y: 50 }} animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={{ duration: 0.8, ease: "easeOut" }}>
          <motion.div className="flex items-center justify-center mb-6 space-x-4" initial={{ scale: 0 }} animate={heroInView ? { scale: 1, rotate: 360 } : { scale: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}>
            <PresentationIcon size={50} />
          </motion.div>
          <motion.h1 className="text-4xl md:text-6xl font-bold mb-6" initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.8, delay: 0.3 }}>
            Create Amazing Presentations with AI
          </motion.h1>
          <motion.p className="text-lg md:text-xl mb-8 text-indigo-100" initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.8, delay: 0.4 }}>
            Transform your ideas into professional PowerPoint presentations in seconds with our AI-powered platform.
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }} transition={{ duration: 0.8, delay: 0.5 }}>
            <Button onClick={onGetStarted} size="lg" className="bg-white text-indigo-600 hover:bg-indigo-100 rounded-full px-8 py-6 text-lg font-medium">
              Get Started <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
        <motion.div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer" animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ArrowDownIcon className="h-10 w-10 opacity-70" />
        </motion.div>
      </motion.div>
      
      {/* Features Section */}
      <motion.div ref={featuresRef} className="py-24 bg-background" variants={staggerContainerVariants} initial="hidden" animate={featuresInView ? "visible" : "hidden"}>
        <div className="container mx-auto px-4">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-center mb-12" variants={itemVariants}>
            Supercharge Your Presentations
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div key={i} className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all" variants={itemVariants} whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
          <motion.div className="mt-16 text-center" variants={itemVariants}>
            <Button onClick={onGetStarted} size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-medium">
              Create Your Presentation Now <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Founders Section */}
      <motion.div ref={foundersRef} className="py-24 bg-gradient-to-b from-background to-background/80" variants={staggerContainerVariants} initial="hidden" animate={foundersInView ? "visible" : "hidden"}>
        <div className="container mx-auto px-4">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-center mb-4" variants={itemVariants}>
            Meet Our Team
          </motion.h2>
          <motion.p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto" variants={itemVariants}>
            The brilliant minds behind Pixel PowerPoint Genie
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {founders.map((founder, idx) => (
              <motion.div key={idx} className="flex flex-col items-center text-center" variants={itemVariants} whileHover={{ y: -5 }}>
                <div className="mb-4 relative">
                  <Avatar className="h-40 w-40 bg-white p-2 rounded-lg">
                    <AvatarImage src={founder.image} alt={founder.name} className="object-contain" />
                    <AvatarFallback className="text-2xl">{founder.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <motion.div className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-full" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Users size={18} />
                  </motion.div>
                </div>
                <h3 className="text-xl font-semibold mb-1">{founder.name}</h3>
                <p className="text-muted-foreground mb-1">{founder.role}</p>
                <p className="text-sm text-muted-foreground mb-2">{founder.description}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {founder.skills.map((skill, s) => (
                    <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{skill}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div className="mt-16 text-center" variants={itemVariants}>
            <Button onClick={onGetStarted} size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-medium">
              Create Your Presentation Now <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
