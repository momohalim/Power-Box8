import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  initialMinutes?: number;
  onExpire?: () => void;
}

export function CountdownTimer({
  initialMinutes = 10,
  onExpire,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg"
    >
      <Clock className="h-5 w-5 animate-pulse" />
      <span>Offer expires in</span>
      <div className="flex items-center gap-1">
        <motion.span
          key={minutes}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="bg-white/20 px-2 py-1 rounded text-xl font-mono"
        >
          {formatTime(minutes)}
        </motion.span>
        <span className="text-xl">:</span>
        <motion.span
          key={seconds}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="bg-white/20 px-2 py-1 rounded text-xl font-mono"
        >
          {formatTime(seconds)}
        </motion.span>
      </div>
      <span>minutes</span>
    </motion.div>
  );
}
