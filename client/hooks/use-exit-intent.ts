import { useEffect, useState } from "react";

interface UseExitIntentOptions {
  enabled?: boolean;
  sensitivity?: number;
  delayInMs?: number;
  onExitIntent?: () => void;
}

export function useExitIntent({
  enabled = true,
  sensitivity = 20,
  delayInMs = 0,
  onExitIntent,
}: UseExitIntentOptions = {}) {
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (!enabled || hasTriggered || typeof window === "undefined") {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleMouseLeave = (event: MouseEvent) => {
      // Only trigger when mouse leaves from the top of the viewport
      if (event.clientY <= sensitivity && event.relatedTarget === null) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          if (!hasTriggered) {
            setHasTriggered(true);
            onExitIntent?.();
          }
        }, delayInMs);
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasTriggered) {
        setHasTriggered(true);
        onExitIntent?.();
      }
    };

    // Handle mobile touch events for exit intent
    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch.clientY <= sensitivity) {
        if (!hasTriggered) {
          setHasTriggered(true);
          onExitIntent?.();
        }
      }
    };

    // Add event listeners
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    // Cleanup
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("touchstart", handleTouchStart);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enabled, sensitivity, delayInMs, hasTriggered, onExitIntent]);

  const resetExitIntent = () => {
    setHasTriggered(false);
  };

  return {
    hasTriggered,
    resetExitIntent,
  };
}
