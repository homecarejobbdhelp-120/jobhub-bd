import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface WelcomePopupProps {
  userName: string;
  onClose: () => void;
}

const WelcomePopup = ({ userName, onClose }: WelcomePopupProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 border-2 border-[#6DBE45]"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-2xl font-bold text-[#0B4A79] mb-2">
            Welcome back!
          </h3>
          <p className="text-gray-600 text-lg">
            {userName}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomePopup;
