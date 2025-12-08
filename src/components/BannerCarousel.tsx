import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBanners, Banner } from "@/hooks/useBanners";
import { cn } from "@/lib/utils";

export function BannerCarousel() {
  const { data: banners, isLoading } = useBanners();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    if (!banners?.length || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners?.length]);

  if (isLoading || !banners?.length) {
    return (
      <div className="relative h-44 lg:h-56 bg-parchment rounded-2xl mx-4 lg:mx-8 mt-4 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Nenhum aviso no momento</p>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = () => {
    if (currentBanner.link_url) {
      window.open(currentBanner.link_url, "_blank");
    }
  };

  return (
    <div className="relative h-44 lg:h-56 mx-4 lg:mx-8 mt-4 overflow-hidden rounded-2xl group">
      {/* Background Image or Gradient */}
      {currentBanner.image_url ? (
        <img
          src={currentBanner.image_url}
          alt={currentBanner.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-rose/10 to-background" />
      )}
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />

      {/* Content */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 lg:p-6",
          currentBanner.link_url && "cursor-pointer"
        )}
        onClick={handleBannerClick}
      >
        <p className="text-xs lg:text-sm uppercase tracking-wider text-gold font-medium mb-1">
          Aviso
        </p>
        <h2 className="font-display text-xl lg:text-2xl font-semibold text-foreground line-clamp-2">
          {currentBanner.title}
        </h2>
        {currentBanner.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {currentBanner.description}
          </p>
        )}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 right-4 flex gap-1.5">
          {banners.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-gold w-4"
                  : "bg-foreground/30 hover:bg-foreground/50"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
