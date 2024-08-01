import { type FC, useEffect, useState } from "react";

export const Loading: FC = () => {
  const [progress, setProgress] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (progress >= 99 || animating) {
      return;
    }

    requestAnimationFrame(() => {
      const step = Math.max((99 - progress) / 10, 1);
      setAnimating(true);
      setProgress(progress + step);
    });
  }, [progress, animating]);

  const customStyles = {
    transform: `scaleX(${Math.floor(progress) / 100})`,
  };

  return (
    <div className="fixed left-0 top-0 z-100 h-[3px] w-full">
      <div
        className="transformOrigin-0 h-full w-full bg-indigo-600 "
        style={{
          ...customStyles,
          transformOrigin: "0",
          transitionDuration: "500ms",
        }}
        onTransitionEnd={() => {
          setAnimating(false);
        }}
      />
    </div>
  );
};
