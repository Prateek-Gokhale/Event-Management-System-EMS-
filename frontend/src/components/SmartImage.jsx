import { useEffect, useState } from "react";
import { fallbackImageUrl, optimizedImageUrl } from "../utils/images";

function SmartImage({ src, alt, className, width, height, ...props }) {
  const [currentSrc, setCurrentSrc] = useState(() => optimizedImageUrl(src, { width, height }));

  useEffect(() => {
    setCurrentSrc(optimizedImageUrl(src, { width, height }));
  }, [src, width, height]);

  return (
    <img
      {...props}
      src={currentSrc || fallbackImageUrl()}
      alt={alt}
      className={className}
      onError={() => setCurrentSrc(fallbackImageUrl())}
    />
  );
}

export default SmartImage;
