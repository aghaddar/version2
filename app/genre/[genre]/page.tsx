import React from "react";
import Image from "next/image";
import Link from "next/link";

export default async function GenrePage({ params }: { params: { genre: string } }) {
  const genre = decodeURIComponent(params.genre);
  let animeList = [];
  let error = null;

  try {
    const res = await fetch(`https://api-consumet-nu.vercel.app/anime/zoro/genre/${encodeURIComponent(genre)}`);
    if (!res.ok) throw new Error("Failed to fetch anime for this genre.");
    const data = await res.json();
    animeList = data.results || [];
  } catch (err: any) {
    error = err.message || "Unknown error";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{genre} Anime</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!error && animeList.length === 0 && (
        <div className="text-gray-400">No anime found for this genre.</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {animeList.map((anime: any) => (
          <Link key={anime.id} href={`/anime/${anime.id}`} className="group block bg-gray-900 rounded-2xl overflow-hidden shadow hover:shadow-lg transition">
            <div className="relative aspect-[2/3] w-full h-48 sm:h-60 md:h-72 overflow-hidden rounded-t-2xl">
              <Image
                src={anime.image || "/placeholder.svg"}
                alt={anime.title?.userPreferred || anime.title || "Anime"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
            <div className="p-3">
              <h2 className="text-base font-semibold text-white line-clamp-2 mb-1">
                {anime.title?.userPreferred || anime.title || "Untitled"}
              </h2>
              {anime.episodes && (
                <div className="text-xs text-gray-400">Episodes: {anime.episodes}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 