import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  initial: { 
    opacity: 0, 
    x: 16,
    filter: 'blur(4px)',
  },
  animate: { 
    opacity: 1, 
    x: 0,
    filter: 'blur(0px)',
  },
  exit: { 
    opacity: 0, 
    x: -16,
    filter: 'blur(4px)',
  },
};

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        duration: 0.22, 
        ease: [0.25, 0.46, 0.45, 0.94], // smooth cubic-bezier
      }}
    >
      {children}
    </motion.div>
  );
};
