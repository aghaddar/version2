import type { WatchlistItem } from "./watchlist-api"

export interface AnimeResult {
  id: string
  title: string
  image: string
  releaseDate?: string | number
  type?: string
  description?: string
  status?: string
  totalEpisodes?: number
  genres?: string[]
  episodes?: Episode[]
  recommendations?: AnimeResult[]
  rating?: number
}

export interface Episode {
  id: string
  number: number
  title?: string
}

export interface Comment {
  id: string | number
  userId: string | number
  episodeId?: string
  content: string
  createdAt: string
  username?: string
  userAvatar?: string
  likes?: number
  replies?: Comment[]
}

// Mock data for when API is unavailable
export const MOCK_POPULAR_ANIME: AnimeResult[] = [
  {
    id: "one-piece",
    title: "One Piece",
    image: "/Straw-Hat-Crew-Adventure.png",
    type: "TV",
    releaseDate: "1999",
    rating: 8.7,
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    image: "/swords-against-shadows.png",
    type: "TV",
    releaseDate: "2019",
    rating: 8.5,
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    image: "/cursed-energy-clash.png",
    type: "TV",
    releaseDate: "2020",
    rating: 8.6,
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    image: "/colossal-silhouette.png",
    type: "TV",
    releaseDate: "2013",
    rating: 9.0,
  },
  {
    id: "my-hero-academia",
    title: "My Hero Academia",
    image: "/hero-academy-gathering.png",
    type: "TV",
    releaseDate: "2016",
    rating: 8.2,
  },
  {
    id: "black-clover",
    title: "Black Clover",
    image: "/black-clover-inspired-team.png",
    type: "TV",
    releaseDate: "2017",
    rating: 8.1,
  },
  {
    id: "overlord",
    title: "Overlord",
    image: "/overlord-anime.png", // Make sure this image exists in public folder
    type: "TV",
    releaseDate: "2015",
    rating: 8.3,
    description:
      "The final hour of the popular virtual reality game Yggdrasil has come. However, Momonga, a powerful wizard and master of the dark guild Ainz Ooal Gown, decides to spend his last few moments in the game as the servers begin to shut down. To his surprise, despite the clock having struck midnight, Momonga is still fully conscious as his character and, moreover, the non-player characters appear to have developed personalities of their own! Confronted with this abnormal situation, Momonga commands his loyal servants to help him investigate and take control of this new world, with the hopes of figuring out what has caused this development and if there may be others in the same predicament.",
    status: "Completed",
    totalEpisodes: 13,
    genres: ["Action", "Adventure", "Fantasy"],
  },
]

// Add a fallback image for Overlord if it doesn't exist
export const FALLBACK_IMAGES = {
  overlord: "/placeholder.svg?key=0ird4",
}

export const getCommentsForEpisode = (episodeId: string): Comment[] => {
  // Mock comments data
  const mockComments: Comment[] = [
    {
      id: "1",
      userId: "101",
      username: "AnimeFan123",
      userAvatar: "/anime-girl-profile.png",
      episodeId: episodeId,
      content: "This episode was amazing!",
      createdAt: new Date().toISOString(),
      likes: 15,
      replies: [
        {
          id: "2",
          userId: "102",
          username: "MangaLover42",
          userAvatar: "/cool-anime-profile.png",
          episodeId: episodeId,
          content: "I agree! The animation was top-notch.",
          createdAt: new Date(new Date().getTime() - 3600000).toISOString(), // 1 hour ago
          likes: 3,
        },
      ],
    },
    {
      id: "3",
      userId: "103",
      username: "KawaiiDesu",
      userAvatar: "/vibrant-anime-profile.png",
      episodeId: episodeId,
      content: "I can't wait for the next episode!",
      createdAt: new Date(new Date().getTime() - 86400000).toISOString(), // 1 day ago
      likes: 7,
      replies: [],
    },
  ]

  return mockComments
}

// Mock data for popular anime
export const getMockPopularAnime = () => [
  {
    id: "1",
    title: "Attack on Titan",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C6FPmWm59CyP.jpg",
    type: "TV",
    releaseDate: "2013",
    rating: 8.9,
    description:
      "Several hundred years ago, humans were nearly exterminated by giants. Giants are typically several stories tall, seem to have no intelligence, devour human beings and, worst of all, seem to do it for the pleasure rather than as a food source. A small percentage of humanity survived by walling themselves in a city protected by extremely high walls, even taller than the biggest of giants. Flash forward to the present and the city has not seen a giant in over 100 years. Teenage boy Eren and his foster sister Mikasa witness something horrific as the city walls are destroyed by a super giant that appears out of thin air. As the smaller giants flood the city, the two kids watch in horror as their mother is eaten alive. Eren vows that he will murder every single giant and take revenge for all of mankind.",
    genres: ["Action", "Drama", "Fantasy"],
  },
  {
    id: "2",
    title: "Demon Slayer",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg",
    type: "TV",
    releaseDate: "2019",
    rating: 8.7,
    description:
      'It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko, the sole survivor, has been transformed into a demon herself. Though devastated by this grim reality, Tanjiro resolves to become a "demon slayer" so that he can turn his sister back into a human, and kill the demon that massacred his family.',
    genres: ["Action", "Fantasy", "Historical"],
  },
  // Add more mock popular anime as needed
]

// Mock data for trending anime
export const getMockTrendingAnime = () => [
  {
    id: "3",
    title: "Jujutsu Kaisen",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-979nF72r8JLj.jpg",
    type: "TV",
    releaseDate: "2020",
    rating: 8.8,
    description:
      "Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life. One day, to save a classmate who has been attacked by curses, he eats the finger of Ryomen Sukuna, taking the curse into his own soul. From then on, he shares one body with Ryomen Sukuna. Guided by the most powerful jujutsu sorcerer, Satoru Gojo, Itadori is admitted to Tokyo Jujutsu High School, an organization that fights the curses... and thus begins the heroic tale of a boy who became a curse to exorcise a curse, a life from which he could never turn back.",
    genres: ["Action", "Supernatural"],
  },
  {
    id: "4",
    title: "My Hero Academia",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21856-UD7JwU5HFJdU.jpg",
    type: "TV",
    releaseDate: "2016",
    rating: 8.5,
    description:
      'What would the world be like if 80 percent of the population manifested superpowers called "Quirks"? Heroes and villains would be battling it out everywhere! Being a hero would mean learning to use your power, but where would you go to study? The Hero Academy of course! But what would you do if you were one of the 20 percent who were born Quirkless? Middle school student Izuku Midoriya wants to be a hero more than anything, but he hasn\'t got an ounce of power in him. With no chance of ever getting into the prestigious U.A. High School for budding heroes, his life is looking more and more like a dead end. Then an encounter with All Might, the greatest hero of them all, gives him a chance to change his destiny…',
    genres: ["Action", "Comedy", "Superhero"],
  },
  // Add more mock trending anime as needed
]

// Mock data for recent episodes
export const getMockRecentEpisodes = () => [
  {
    id: "5",
    title: "One Piece",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx21-tXMN3Y20PIL9.jpg",
    type: "TV",
    releaseDate: "1999",
    episodeNumber: 1015,
    episodeTitle: "The Climactic Battle! Straw Hat Luffy vs. Kaido!",
    episodeId: "one-piece-1015",
    dateAdded: "2023-05-01T12:00:00Z",
  },
  {
    id: "6",
    title: "Chainsaw Man",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-FlochcFsyoF4.png",
    type: "TV",
    releaseDate: "2022",
    episodeNumber: 12,
    episodeTitle: "Katana vs. Chainsaw",
    episodeId: "chainsaw-man-12",
    dateAdded: "2023-05-02T14:30:00Z",
  },
  // Add more mock recent episodes as needed
]

// Add more mock data functions as needed

// Mock data for featured anime
export const getMockFeaturedAnime = () => [
  {
    id: "7",
    title: "Spy x Family",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-vN39AmOWrVB5.jpg",
    type: "TV",
    releaseDate: "2022",
    rating: 8.7,
    description:
      "Everyone has a part of themselves they cannot show to anyone else. At a time when all nations of the world were involved in a fierce war of information happening behind closed doors, Ostania and Westalis had been in a state of cold war against one another for decades. The Westalis Intelligence Services' Eastern-Focused Division (WISE) sends their most talented spy, 'Twilight,' on a top-secret mission to investigate the movements of Donovan Desmond, the chairman of Ostania's National Unity Party, who is threatening peace efforts between the two nations.",
    genres: ["Action", "Comedy", "Slice of Life"],
  },
  {
    id: "8",
    title: "Vinland Saga",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-YfZhKBnDqpMi.jpg",
    type: "TV",
    releaseDate: "2019",
    rating: 8.8,
    description:
      "Young Thorfinn grew up listening to the stories of old sailors that had traveled the ocean and reached the place of legend, Vinland. It's said to be warm and fertile, a place where there would be no need for fighting—not at all like the frozen village in Iceland where he was born, and certainly not like his current life as a mercenary. War is his home now. Though his father once told him, 'You have no enemies, nobody does. There is nobody who it's okay to hurt,' as he grew, Thorfinn knew that nothing was further from the truth.",
    genres: ["Action", "Adventure", "Drama"],
  },
  // Add more mock featured anime as needed
]
