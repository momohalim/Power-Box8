import { motion } from "framer-motion";

const snackEmojis = [
  "🥨",
  "🥜",
  "🍿",
  "🥨",
  "🧀",
  "🫘",
  "🥜",
  "🍇",
  "🍊",
  "🍎",
];

export function FloatingSnacks() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {snackEmojis.map((emoji, index) => (
        <motion.div
          key={index}
          className="absolute text-2xl opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50,
          }}
          animate={{
            y: -50,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: index * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${index * 2}s`,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}
