"use client";

import { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import WatchlistButton from "@/components/WatchlistButton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Anime {
  id: string;
  title: string;
  description?: string;
  type?: string;
  releaseDate?: string;
  image?: string;
}

interface HeroSliderProps {
  featuredAnime: Anime[];
}

export default function HeroSlider({ featuredAnime }: HeroSliderProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    if (
      swiperRef.current &&
      swiperRef.current.params &&
      prevRef.current &&
      nextRef.current
    ) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.destroy();
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, [featuredAnime]); // or [] if slides never change

  if (!featuredAnime || featuredAnime.length === 0) return null;

  return (
    <div className="relative w-full h-[500px]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        loop
        className="h-full"
      >
        {featuredAnime.map((anime) => (
          <SwiperSlide key={anime.id}>
            <div className="relative w-full h-[500px]">
              <Image
                src={anime.image || "/placeholder.svg"}
                alt={anime.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 md:p-12 max-w-3xl z-10 pb-16 sm:pb-24 md:pb-32">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white">{anime.title}</h1>
                <div className="flex items-center text-xs sm:text-sm text-gray-300 mb-2 sm:mb-4">
                  <span>{anime.type || "TV"}</span>
                  <span className="mx-2">•</span>
                  <span>{anime.releaseDate || "2023"}</span>
                </div>
                <p className="text-gray-300 mb-4 sm:mb-8 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">
                  {anime.description || "No description available."}
                </p>
                <div className="flex space-x-2 sm:space-x-4">
                  <Link href={`/anime/${anime.id}`}>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm py-1 px-3 sm:py-2 sm:px-4 h-9 sm:h-11 flex items-center rounded-full">
                      Play Now
                    </Button>
                  </Link>
                  <WatchlistButton
                    animeId={anime.id}
                    title={anime.title}
                    imageUrl={anime.image}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm py-1 px-3 sm:py-2 sm:px-4 h-9 sm:h-11 flex items-center rounded-full"
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Custom Navigation Arrows */}
      <button
        ref={prevRef}
        className="custom-swiper-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
        aria-label="Previous slide"
        type="button"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>
      <button
        ref={nextRef}
        className="custom-swiper-next absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
        aria-label="Next slide"
        type="button"
      >
        <ChevronRight className="w-7 h-7" />
      </button>
    </div>
  );
}
