import React, { useEffect, useRef } from 'react';
import styles from './Observer.module.css'; // Import your CSS module

export default function Observer() {
  // Single reusable hook for fade animation
  const useFadeAnimation = (className, threshold = 0.1) => {
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(styles.Show);
              entry.target.classList.remove(styles.Hidden);
            } else {
              entry.target.classList.remove(styles.Show);
              entry.target.classList.add(styles.Hidden);
            }
          });
        },
        { threshold }
      );

      const hiddenElements = document.querySelectorAll(`.${styles.Hidden}`);
      hiddenElements.forEach((el) => observer.observe(el));

      return () => {
        hiddenElements.forEach((el) => observer.unobserve(el));
        observer.disconnect();
      };
    }, [className, threshold]);
  };

  // Single reusable hook for slide animation
  const useSlideAnimation = (className, threshold = 0.1) => {
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(styles.slide);
              entry.target.classList.remove(styles.Hidden);
            } else {
              entry.target.classList.remove(styles.slide);
              entry.target.classList.add(styles.Hidden);
            }
          });
        },
        { threshold }
      );

      const hiddenElements = document.querySelectorAll(`.${styles.Hidden}`);
      hiddenElements.forEach((el) => observer.observe(el));

      return () => {
        hiddenElements.forEach((el) => observer.unobserve(el));
        observer.disconnect();
      };
    }, [className, threshold]);
  };

  return {
    useFadeAnimation,
    useSlideAnimation
  };
}

// Alternative: Custom hooks approach (recommended)
export const useIntersectionObserver = (animationClass, threshold = 0.1) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles[animationClass]);
            entry.target.classList.remove(styles.Hidden);
          } else {
            entry.target.classList.remove(styles[animationClass]);
            entry.target.classList.add(styles.Hidden);
          }
        });
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      observer.disconnect();
    };
  }, [animationClass, threshold]);

  return elementRef;
};


//how to use the function
{/**
    import React from 'react';
import { useIntersectionObserver } from './Observer';
import styles from './YourComponent.module.css';

function YourComponent() {
  const fadeRef = useIntersectionObserver('Show');
  const slideRef = useIntersectionObserver('slide');

  return (
    <div>
      <div ref={fadeRef} className={styles.Hidden}>
        This will fade in when visible
      </div>
      
      <div ref={slideRef} className={styles.Hidden}>
        This will slide in when visible
      </div>
    </div>
  );
}

export default YourComponent;
*/}