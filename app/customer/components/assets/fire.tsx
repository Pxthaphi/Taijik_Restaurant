import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface FireAnimationProps {
  size?: number; // Optional prop for size
}

const FireAnimation: React.FC<FireAnimationProps> = ({ size = 100 }) => { // Default size is set to 100
  const animationContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (animationContainer.current) {
      const animation = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/Fire_animation.json',
      });

      // Cleanup animation on component unmount
      return () => {
        animation.destroy();
      };
    }
  }, []);

  return (
    <div
      ref={animationContainer}
      style={{ width: `${size}px`, height: `${size}px` }} // Set the size based on prop
    ></div>
  );
};

export default FireAnimation;
