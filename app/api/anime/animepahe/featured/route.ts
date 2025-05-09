import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("API route: /api/anime/animepahe/featured called")

    // In a real implementation, you would fetch featured anime from an external API
    // For now, we'll use our mock data and enhance it with more details for the slider

    // Select a few anime from our mock data to feature in the slider
    const featuredAnime = [
      {
        id: "zenshu",
        title: "Zenshu",
        description:
          "After graduating from high school, Nagase finds her career as an animator. Her talent quickly flourishes, and she makes her debut as a director in a short film. Her next project is set to be a romantic comedy movie themed around a high school setting. Having never been in love herself, she's unable to create the story about a coming-of-age movie production to come to a standstill.",
        type: "TV",
        releaseDate: "Jan 5, 2025",
        image: "/street-beats.png",
      },
      {
        id: "demon-slayer",
        title: "Demon Slayer",
        description:
          "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
        type: "TV",
        releaseDate: "Apr 6, 2019",
        image: "/demon-slayer-trio.png",
      },
      {
        id: "attack-on-titan",
        title: "Attack on Titan",
        description:
          "After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
        type: "TV",
        releaseDate: "Apr 7, 2013",
        image: "/colossal-silhouette.png",
      },
    ]

    console.log(`Returning ${featuredAnime.length} featured anime`)

    // Return the array directly, not wrapped in an object
    return NextResponse.json(featuredAnime)
  } catch (error) {
    console.error("Error in animepahe featured API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
