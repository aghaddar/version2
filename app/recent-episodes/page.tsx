import React from "react";
import Image from "next/image";
import Link from "next/link";

export default async function RecentEpisodesPage() {
  let episodes = [];
  let error = null;

  try {
    const res = await fetch("https://api-consumet-nu.vercel.app/anime/zoro/recent-episodes");
    if (!res.ok) throw new Error("Failed to fetch recent episodes.");
    const data = await res.json();
    episodes = data.results || [];
  } catch (err: any) {
    error = err.message || "Unknown error";
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Recent Episodes</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!error && episodes.length === 0 && (
          <div className="text-gray-400">No recent episodes found.</div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {episodes.map((ep: any) => (
            <Link key={ep.id} href={`/anime/${ep.id}`} className="group block bg-gray-900 rounded-2xl overflow-hidden shadow hover:shadow-lg transition">
              <div className="relative aspect-[2/3] w-full h-48 sm:h-60 md:h-72 overflow-hidden rounded-t-2xl">
                <Image
                  src={ep.image || "/placeholder.svg"}
                  alt={ep.title || "Anime"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <div className="p-3">
                <h2 className="text-base font-semibold text-white line-clamp-2 mb-1">
                  {ep.title || "Untitled"}
                </h2>
                {ep.duration && (
                  <div className="text-xs text-gray-400">Duration: {ep.duration}</div>
                )}
                {ep.type && (
                  <div className="text-xs text-gray-400">Type: {ep.type}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 