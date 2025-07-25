import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Import background images
import bgMountainSunset from '@/assets/bg-mountain-sunset.jpg';
import bgForestMist from '@/assets/bg-forest-mist.jpg';
import bgOceanCliffs from '@/assets/bg-ocean-cliffs.jpg';

// Import foreground images
import waterfallTropical from '@/assets/waterfall-tropical.jpg';
import mountainPeak from '@/assets/mountain-peak.jpg';
import flowerField from '@/assets/flower-field.jpg';

interface GalleryItem {
  id: string;
  image: string;
  title: string;
  author: string;
  date: string;
  description: string;
}

interface BackgroundImage {
  id: string;
  image: string;
  name: string;
}

const backgroundImages: BackgroundImage[] = [
  { id: 'bg1', image: bgMountainSunset, name: 'Mountain Sunset' },
  { id: 'bg2', image: bgForestMist, name: 'Forest Mist' },
  { id: 'bg3', image: bgOceanCliffs, name: 'Ocean Cliffs' },
];

const galleryItems: GalleryItem[] = [
  {
    id: '1',
    image: waterfallTropical,
    title: 'Tropical Paradise',
    author: 'Nature Explorer',
    date: '2024-01-15',
    description: 'A stunning waterfall hidden in the heart of a tropical forest, where crystal clear water cascades through lush vegetation.'
  },
  {
    id: '2',
    image: mountainPeak,
    title: 'Alpine Majesty',
    author: 'Mountain Photographer',
    date: '2024-01-20',
    description: 'The raw beauty of snow-capped peaks reaching toward the heavens, captured in perfect morning light.'
  },
  {
    id: '3',
    image: flowerField,
    title: 'Wildflower Dreams',
    author: 'Botanical Artist',
    date: '2024-01-25',
    description: 'A meadow alive with vibrant wildflowers, painting the landscape in nature\'s most beautiful colors.'
  },
];

export default function ParallaxGallery() {
  const [visibleItems, setVisibleItems] = useState<GalleryItem[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Initialize with first batch of items
  useEffect(() => {
    setVisibleItems(galleryItems.slice(0, 3));
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Change background based on scroll position
  useEffect(() => {
    if (backgroundImages.length === 0) return;
    
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    
    const scrollProgress = scrollY / scrollHeight;
    const newBgIndex = Math.floor(scrollProgress * backgroundImages.length);
    const clampedIndex = Math.max(0, Math.min(newBgIndex, backgroundImages.length - 1));
    
    if (clampedIndex !== currentBgIndex && backgroundImages[clampedIndex]) {
      setCurrentBgIndex(clampedIndex);
    }
  }, [scrollY, currentBgIndex]);

  // Load more items
  const loadMoreItems = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setVisibleItems(prev => {
        const currentLength = prev.length;
        const itemsPerLoad = 3;
        const newItems: GalleryItem[] = [];
        
        for (let i = 0; i < itemsPerLoad; i++) {
          const sourceIndex = (currentLength + i) % galleryItems.length;
          const newItem = {
            ...galleryItems[sourceIndex],
            id: `${galleryItems[sourceIndex].id}-${currentLength + i}`,
          };
          newItems.push(newItem);
        }
        
        return [...prev, ...newItems];
      });
      setIsLoading(false);
    }, 500);
  }, [isLoading]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMoreItems]);

  // Memory optimization - remove items that are far off-screen
  useEffect(() => {
    const handleMemoryOptimization = () => {
      if (visibleItems.length > 20) {
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        const keepAfterScroll = scrollTop - viewportHeight * 2;
        
        setVisibleItems(prev => {
          const itemHeight = 600; // Approximate item height
          const itemsToKeep = Math.floor(keepAfterScroll / itemHeight);
          return prev.slice(Math.max(0, itemsToKeep));
        });
      }
    };

    const throttledOptimization = throttle(handleMemoryOptimization, 1000);
    window.addEventListener('scroll', throttledOptimization, { passive: true });
    
    return () => window.removeEventListener('scroll', throttledOptimization);
  }, [visibleItems.length]);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Fixed Parallax Background */}
      {backgroundImages.length > 0 && backgroundImages[currentBgIndex] && (
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center bg-fixed transition-all duration-1000 ease-out"
          style={{
            backgroundImage: `url(${backgroundImages[currentBgIndex].image})`,
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* Header */}
      <header className="relative z-20 pt-8 pb-16">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-start">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-4">
                Nature Gallery
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
                Immerse yourself in the breathtaking beauty of our natural world
              </p>
            </div>
            <nav className="backdrop-blur-md bg-white/10 rounded-lg px-6 py-3 border border-white/20">
              <a 
                href="#about" 
                className="text-white hover:text-accent transition-colors duration-300 font-medium"
              >
                About Us
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Gallery Content */}
      <main className="relative z-10">
        <div className="container mx-auto px-6 pb-20">
          <div className="grid gap-12 md:gap-20">
            {visibleItems.map((item, index) => (
              <article 
                key={item.id}
                className={cn(
                  "opacity-0 animate-fade-in",
                  "grid md:grid-cols-2 gap-8 items-center",
                  index % 2 === 1 ? "md:grid-flow-col-dense" : ""
                )}
                style={{
                  animationDelay: `${(index % 3) * 200}ms`
                }}
              >
                {/* Image */}
                <div className={cn(
                  "relative group overflow-hidden rounded-2xl shadow-2xl",
                  index % 2 === 1 ? "md:col-start-2" : ""
                )}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-80 md:h-96 object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className={cn(
                  "backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-2xl p-8 shadow-xl border border-white/20",
                  index % 2 === 1 ? "md:col-start-1 md:row-start-1" : ""
                )}>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
                    {item.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium text-primary">{item.author}</span>
                    <span>•</span>
                    <time dateTime={item.date}>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Loading indicator */}
          <div 
            ref={loadingRef}
            className="flex justify-center items-center py-16"
          >
            {isLoading && (
              <div className="backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-full p-6 shadow-xl border border-white/20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Utility function for throttling
function throttle<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  }) as T;
}