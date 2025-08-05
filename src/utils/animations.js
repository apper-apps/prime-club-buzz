// Global Animation Configuration
// Centralized animation presets for consistent motion design across the application

// Common easing curves
export const easings = {
  smooth: [0.25, 0.1, 0.25, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  swift: [0.4, 0, 0.2, 1],
  gentle: [0.25, 0.46, 0.45, 0.94],
  snappy: [0.55, 0.085, 0.68, 0.53]
};

// Animation durations (in seconds)
export const durations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.75
};

// Page transition animations
export const pageTransitions = {
  fadeSlide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { 
      duration: durations.normal,
      ease: easings.smooth 
    }
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { 
      duration: durations.normal,
      ease: easings.swift 
    }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { 
      duration: durations.normal,
      ease: easings.smooth 
    }
  }
};

// Modal animations
export const modalAnimations = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: durations.fast }
  },
  content: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { 
      duration: durations.normal,
      ease: easings.smooth 
    }
  },
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { 
      duration: durations.normal,
      ease: easings.swift 
    }
  }
};

// Card animations
export const cardAnimations = {
  hover: {
    scale: 1.02,
    transition: { 
      duration: durations.fast,
      ease: easings.swift 
    }
  },
  tap: {
    scale: 0.98,
    transition: { 
      duration: 0.1,
      ease: easings.swift 
    }
  },
  listItem: (index = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { 
      duration: durations.normal,
      delay: index * 0.05,
      ease: easings.smooth 
    }
  }),
  staggeredGrid: (index = 0) => ({
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { 
      duration: durations.normal,
      delay: index * 0.1,
      ease: easings.smooth 
    }
  })
};

// Button animations
export const buttonAnimations = {
  press: {
    scale: 0.95,
    transition: { 
      duration: 0.1,
      ease: easings.swift 
    }
  },
  release: {
    scale: 1,
    transition: { 
      duration: 0.1,
      ease: easings.swift 
    }
  },
  loading: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: easings.gentle
    }
  }
};

// List animations
export const listAnimations = {
  container: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { 
      duration: durations.fast,
      staggerChildren: 0.05 
    }
  },
  item: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { 
      duration: durations.normal,
      ease: easings.smooth 
    }
  },
  staggered: (index = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: durations.normal,
      delay: index * 0.1,
      ease: easings.smooth 
    }
  })
};

// Loading animations
export const loadingAnimations = {
  spinner: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easings.gentle
    }
  },
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: easings.bounce
    }
  }
};

// Notification animations
export const notificationAnimations = {
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { 
      duration: durations.normal,
      ease: easings.swift 
    }
  },
  slideInTop: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { 
      duration: durations.normal,
      ease: easings.swift 
    }
  }
};

// Utility functions for creating custom animations
export const createStaggeredAnimation = (baseAnimation, staggerDelay = 0.1) => {
  return (index = 0) => ({
    ...baseAnimation,
    transition: {
      ...baseAnimation.transition,
      delay: index * staggerDelay
    }
  });
};

export const createDelayedAnimation = (baseAnimation, delay = 0) => ({
  ...baseAnimation,
  transition: {
    ...baseAnimation.transition,
    delay
  }
});

// Spring presets for more natural motion
export const springPresets = {
  gentle: { type: "spring", stiffness: 100, damping: 15 },
  wobbly: { type: "spring", stiffness: 180, damping: 12 },
  stiff: { type: "spring", stiffness: 300, damping: 30 },
  slow: { type: "spring", stiffness: 80, damping: 14 }
};

// Layout animations for shared element transitions
export const layoutAnimations = {
  shared: {
    layoutId: "shared-element",
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30 
    }
  }
};

// Default export with most commonly used animations
export default {
  pageTransitions,
  modalAnimations,
  cardAnimations,
  buttonAnimations,
  listAnimations,
  loadingAnimations,
  notificationAnimations,
  easings,
  durations,
  springPresets
};