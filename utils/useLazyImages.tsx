import { useEffect } from "react";

const config = {
  rootMargin: "200px 0px",
  threshold: 0.01,
};

function preloadImage(img:any) {
  const src = img.getAttribute("data-src"),
    holderImage = new Image();

  holderImage.src = src;
  holderImage.onload = () => {
    img.src = src;
  };
}

export function useLazyImages() {
  useEffect(() => {
    const images = Array.from(document.querySelectorAll("img[data-src]"));
    function onIntersection(entries: any) {
      entries.forEach((entry: any) => {
        if (entry.intersectionRatio > 0) {
          preloadImage(entry.target);
        }
      });
    }

    if (!("IntersectionObserver" in window)) {
      images.forEach((image) => preloadImage(image));
    } else {
      const observer = new IntersectionObserver(onIntersection, config);
      images.forEach((image) => {
        observer.observe(image);
      });
      return () => observer.disconnect();
    }
  });
}
