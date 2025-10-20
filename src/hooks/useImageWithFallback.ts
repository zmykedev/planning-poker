import { useState, useEffect } from 'react';

interface UseImageWithFallbackOptions {
  src?: string;
  fallbackSrc?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseImageWithFallbackReturn {
  imageSrc: string | null;
  imageError: boolean;
  imageLoading: boolean;
  retry: () => void;
}

export const useImageWithFallback = ({
  src,
  fallbackSrc,
  retryAttempts = 2,
  retryDelay = 1000,
}: UseImageWithFallbackOptions): UseImageWithFallbackReturn => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [setAttempts] = useState(0);

  const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  };

  const tryLoadImage = async (url: string, attempt: number = 0): Promise<void> => {
    try {
      setImageLoading(true);
      setImageError(false);

      await loadImage(url);
      setImageSrc(url);
      setAttempts(0);
    } catch (error) {
      console.warn(`Failed to load image (attempt ${attempt + 1}):`, url, error);

      if (attempt < retryAttempts) {
        setTimeout(() => {
          setAttempts(attempt + 1);
          tryLoadImage(url, attempt + 1);
        }, retryDelay);
      } else if (fallbackSrc && url !== fallbackSrc) {
        // Try fallback image
        tryLoadImage(fallbackSrc, 0);
      } else {
        setImageError(true);
        setImageSrc(null);
      }
    } finally {
      setImageLoading(false);
    }
  };

  const retry = () => {
    if (src) {
      setAttempts(0);
      tryLoadImage(src, 0);
    }
  };

  useEffect(() => {
    if (src) {
      tryLoadImage(src, 0);
    } else {
      setImageSrc(null);
      setImageError(false);
      setImageLoading(false);
    }
  }, [src, fallbackSrc, retryAttempts, retryDelay]);

  return {
    imageSrc,
    imageError,
    imageLoading,
    retry,
  };
};
