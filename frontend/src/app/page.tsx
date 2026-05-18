"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon, Sparkles, UserCircle2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";

function AnimatedCounter({ from, to, duration = 2, suffix = "" }: { from: number; to: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        setCount(Math.floor(progress * (to - from) + from));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, from, to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const text = "Bring History to Life in Vivid Color";
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const featureCards = [
    {
      title: "Chroma Base",
      description: "Our versatile general-purpose model. Excels at everyday scenes, street photography, and mixed compositions.",
      icon: Sparkles,
      color: "from-blue-500/20 to-purple-500/20",
      borderGlow: "group-hover:border-blue-500/50",
      iconColor: "text-blue-500",
    },
    {
      title: "Chroma Landscape",
      description: "Tuned specifically for nature and urban landscapes. Captures vibrant skies, lush greenery, and architectural details.",
      icon: ImageIcon,
      color: "from-emerald-500/20 to-teal-500/20",
      borderGlow: "group-hover:border-emerald-500/50",
      iconColor: "text-emerald-500",
    },
    {
      title: "Chroma Portrait",
      description: "Optimized for human faces and skin tones. Delivers lifelike, natural warmth to historical portraits and family photos.",
      icon: UserCircle2,
      color: "from-rose-500/20 to-orange-500/20",
      borderGlow: "group-hover:border-rose-500/50",
      iconColor: "text-rose-500",
    }
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center overflow-hidden" ref={containerRef}>
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 z-[-1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 z-[-2] h-full w-full bg-background" />

      {/* Hero Section */}
      <motion.div 
        style={{ y, opacity }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center flex flex-col items-center justify-center min-h-[80vh]"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center mb-6"
        >
          {words.map((word, index) => (
            <motion.span
              variants={wordVariants}
              key={index}
              className={`text-5xl md:text-7xl font-extrabold tracking-tight mr-4 ${
                index >= 4 ? "bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400" : ""
              }`}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Chroma AI uses state-of-the-art deep learning models to colorize black and white images with astonishing realism. Experience structural integrity and vibrant, accurate colors.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-primary rounded-full overflow-hidden shadow-[0_0_40px_rgba(var(--primary),0.4)] transition-shadow hover:shadow-[0_0_60px_rgba(var(--primary),0.6)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              Start Colorizing
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <Link href="/pricing">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center px-8 py-4 font-semibold text-foreground bg-accent/50 backdrop-blur-sm border border-border/50 rounded-full hover:bg-accent transition-colors"
            >
              View Pricing
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Interactive Stats */}
      <div className="w-full bg-accent/30 border-y border-border/40 backdrop-blur-md py-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border/50">
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                <AnimatedCounter from={0} to={50} suffix="M+" duration={2.5} />
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Images Colorized</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                <AnimatedCounter from={0} to={99} suffix=".4%" duration={2} />
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Color Accuracy</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                &lt; <AnimatedCounter from={10} to={2} suffix="s" duration={2} />
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Inference Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Feature Cards */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Specialized AI Models</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Select the perfect model for your specific image type to achieve breathtaking, context-aware colorization.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {featureCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className={`group relative p-8 rounded-3xl bg-card border border-border/50 transition-all duration-300 hover:shadow-2xl overflow-hidden ${card.borderGlow}`}
            >
              {/* Animated Glow Background */}
              <div className={`absolute -inset-px opacity-0 group-hover:opacity-100 bg-gradient-to-br ${card.color} rounded-3xl transition-opacity duration-500 blur-2xl -z-10`} />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <card.icon className={`h-8 w-8 ${card.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
