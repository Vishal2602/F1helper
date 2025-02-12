import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type Emotion = "neutral" | "happy" | "thinking" | "confused";

interface MascotAvatarProps {
  emotion: Emotion;
  className?: string;
}

const emotionVariants = {
  neutral: {
    eyes: { y: 0 },
    mouth: { d: "M 13 20 Q 25 20 37 20" }
  },
  happy: {
    eyes: { y: 0 },
    mouth: { d: "M 13 20 Q 25 25 37 20" }
  },
  thinking: {
    eyes: { y: -2 },
    mouth: { d: "M 13 20 Q 25 15 37 20" }
  },
  confused: {
    eyes: { y: 0 },
    mouth: { d: "M 13 20 Q 25 15 37 25" }
  }
};

export function MascotAvatar({ emotion = "neutral", className = "" }: MascotAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Random blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 4000 + 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <motion.svg
      viewBox="0 0 50 50"
      className={`w-12 h-12 ${className}`}
      initial="neutral"
      animate={emotion}
      variants={emotionVariants}
    >
      {/* Face background */}
      <circle cx="25" cy="25" r="20" fill="hsl(var(--primary))" />
      
      {/* Eyes */}
      <motion.g variants={{ blink: { scaleY: 0.1 }, open: { scaleY: 1 } }}
        animate={isBlinking ? "blink" : "open"}
        transition={{ duration: 0.1 }}>
        <motion.circle variants={{ eyes: {} }} cx="17" cy="20" r="3" fill="white" />
        <motion.circle variants={{ eyes: {} }} cx="33" cy="20" r="3" fill="white" />
      </motion.g>

      {/* Mouth */}
      <motion.path
        variants={{ mouth: {} }}
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
    </motion.svg>
  );
}
