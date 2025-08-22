import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePopups, useEmailSubscription } from "@/hooks/use-popups";

interface EnhancedExitIntentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe?: (email: string) => void;
}

export function EnhancedExitIntentPopup({
  isOpen,
  onClose,
  onSubscribe,
}: EnhancedExitIntentPopupProps) {
  const { exitIntentPopupData } = usePopups();
  const { subscribeEmail } = useEmailSubscription();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const result = await subscribeEmail(email);

      if (result.success) {
        setMessage("Thank you for subscribing! 🎉");
        if (onSubscribe) {
          onSubscribe(email);
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(result.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setEmail("");
    setMessage("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 500,
              duration: 0.3,
            }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Close popup"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Content */}
            <div className="p-8 pt-12">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {exitIntentPopupData.title}
                </h2>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {exitIntentPopupData.description}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={exitIntentPopupData.email_placeholder}
                    className="w-full px-4 py-3 text-center text-lg"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {message && (
                  <div
                    className={`text-center text-sm ${
                      message.includes("Thank you")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="flex-1 py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Subscribing...
                      </>
                    ) : (
                      exitIntentPopupData.subscribe_button_text
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDismiss}
                    disabled={isSubmitting}
                    className="flex-1 py-3 text-lg"
                  >
                    {exitIntentPopupData.dismiss_button_text}
                  </Button>
                </div>
              </form>

              {/* Privacy Note */}
              <div className="mt-6 flex items-start gap-2 text-xs text-gray-500">
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  {exitIntentPopupData.privacy_note}
                </p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
