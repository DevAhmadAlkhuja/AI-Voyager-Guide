import destGeorgetown from "@/assets/dest-georgetown.jpg";
import destBotanical from "@/assets/dest-botanical.jpg";
import destBatu from "@/assets/dest-batu.jpg";
import destLangkawi from "@/assets/dest-langkawi.jpg";
import destTimessquare from "@/assets/dest-timessquare.jpg";

export interface Destination {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  bestTime: string;
  description: string;
  overview: string;
  attractions: string[];
  events: string[];
  reviews: number;
  bookingLinks: { label: string; url: string }[];
}

export const allDestinations: Destination[] = [
  {
    id: "george-town",
    name: "George Town",
    image: destGeorgetown,
    category: "City",
    rating: 4.8,
    bestTime: "Nov - Mar",
    description: "A UNESCO World Heritage Site famous for its unique architecture, vibrant street art, and rich multicultural heritage blending Chinese, Malay, Indian, and European influences.",
    overview: "George Town, the capital of Penang, was inscribed as a UNESCO World Heritage Site in 2008. Founded in 1786 by Captain Francis Light, it represents one of the most complete surviving historic city centres in Southeast Asia. The city's unique architectural and cultural townscape is a living testament to the multi-cultural heritage and traditions of Asia, with buildings and cultural influences from Malay, Chinese, Indian, and European civilizations.",
    attractions: ["Street Art Trail", "Clan Jetties", "Khoo Kongsi Temple", "Fort Cornwallis", "Cheong Fatt Tze Mansion", "Penang Hill"],
    events: ["George Town Festival (Jul)", "Thaipusam (Jan/Feb)", "Chinese New Year Celebrations", "Penang International Food Festival"],
    reviews: 234,
    bookingLinks: [
      { label: "Hotels in George Town", url: "https://www.booking.com/city/my/george-town.html" },
      { label: "Flights to Penang", url: "https://www.skyscanner.com/flights-to/pen/" },
    ],
  },
  {
    id: "botanical-gardens",
    name: "Penang Botanical Gardens",
    image: destBotanical,
    category: "Nature",
    rating: 4.6,
    bestTime: "Year-round",
    description: "A lush 30-hectare tropical garden established in 1884, home to exotic plant species, waterfalls, and playful long-tailed macaques in a serene rainforest setting.",
    overview: "The Penang Botanical Gardens, affectionately known as the Waterfall Gardens, were founded by Charles Curtis in 1884. Nestled in a valley surrounded by hills, these gardens showcase over 1,000 plant species from around the tropical world. The gardens serve as a green lung for Penang and are a popular spot for morning joggers, nature lovers, and families.",
    attractions: ["Waterfall Hill Trail", "Orchid House", "Lily Pond", "Canopy Walk", "Fern Rockery", "Cactus Garden"],
    events: ["Morning Yoga Sessions", "Guided Nature Walks", "Photography Workshops", "Garden Festival (Annual)"],
    reviews: 189,
    bookingLinks: [
      { label: "Nearby Hotels", url: "https://www.booking.com/searchresults.html?ss=Penang+Botanical+Gardens" },
      { label: "Guided Tours", url: "https://www.viator.com/Penang-attractions/Penang-Botanic-Gardens/d4469-a14963" },
    ],
  },
  {
    id: "batu-caves",
    name: "Batu Caves",
    image: destBatu,
    category: "Cultural",
    rating: 4.7,
    bestTime: "Jan - Mar",
    description: "An iconic limestone hill featuring a series of caves and cave temples, guarded by the world's tallest Lord Murugan statue. A must-visit cultural and natural landmark.",
    overview: "Batu Caves is a limestone hill comprising three major caves and several smaller ones, located 13 km north of Kuala Lumpur. The caves have been used as a Hindu temple since 1891 and are dedicated to Lord Murugan. The 42.7-metre tall golden statue of Lord Murugan at the base is the tallest of its kind in the world. The 272 rainbow-painted steps leading up to the Temple Cave have become one of Malaysia's most photographed landmarks.",
    attractions: ["Cathedral Cave", "Dark Cave", "Ramayana Cave", "272 Rainbow Steps", "Lord Murugan Statue", "Cave Villa"],
    events: ["Thaipusam Festival (Jan/Feb)", "Deepavali Celebrations", "Cultural Dance Performances"],
    reviews: 456,
    bookingLinks: [
      { label: "KL Hotels", url: "https://www.booking.com/city/my/kuala-lumpur.html" },
      { label: "Day Tours", url: "https://www.getyourguide.com/batu-caves-l4237/" },
    ],
  },
  {
    id: "langkawi",
    name: "Langkawi Island",
    image: destLangkawi,
    category: "Island",
    rating: 4.9,
    bestTime: "Dec - Mar",
    description: "A stunning archipelago of 99 islands known for crystal-clear waters, duty-free shopping, mangrove forests, and the iconic Sky Bridge offering breathtaking panoramic views.",
    overview: "Langkawi, officially known as Langkawi, the Jewel of Kedah, is an archipelago of 99 islands in the Andaman Sea. It has been awarded UNESCO Global Geopark status for its rich geological heritage spanning 550 million years. The island combines pristine beaches, dense rainforests, and dramatic limestone formations with modern resorts and duty-free shopping. Legend has it that the island was cursed for seven generations by Mahsuri, a legendary figure wrongly accused of adultery.",
    attractions: ["Sky Bridge", "Eagle Square", "Mangrove Tour", "Underwater World", "Langkawi Cable Car", "Tanjung Rhu Beach"],
    events: ["Langkawi International Maritime & Aerospace Exhibition", "Tour de Langkawi", "Ironman Langkawi", "Royal Langkawi International Regatta"],
    reviews: 567,
    bookingLinks: [
      { label: "Langkawi Hotels", url: "https://www.booking.com/city/my/langkawi.html" },
      { label: "Flights to Langkawi", url: "https://www.skyscanner.com/flights-to/lgk/" },
      { label: "Island Hopping Tours", url: "https://www.viator.com/Langkawi/d4471" },
    ],
  },
  {
    id: "times-square",
    name: "Times Square Theme Park",
    image: destTimessquare,
    category: "Entertainment",
    rating: 4.3,
    bestTime: "Year-round",
    description: "Southeast Asia's largest indoor theme park located inside the Berjaya Times Square mall. Features thrilling rides and attractions across multiple themed zones.",
    overview: "Berjaya Times Square Theme Park is an indoor amusement park situated on the 5th and 7th floors of Berjaya Times Square in Kuala Lumpur. Spanning over 133,000 square feet, it is one of the largest indoor theme parks in Asia. The park features two zones — Galaxy Station for thrill-seekers and Fantasy Garden for families — with over 20 rides including Asia's longest indoor roller coaster.",
    attractions: ["Supersonic Odyssey", "DNA Mixer", "Fantasy Garden", "Galaxy Station", "Spinning Orbit", "Haunted Chamber"],
    events: ["School Holiday Specials", "Halloween Night", "Christmas Festival", "New Year Countdown"],
    reviews: 123,
    bookingLinks: [
      { label: "KL Hotels", url: "https://www.booking.com/city/my/kuala-lumpur.html" },
      { label: "Theme Park Tickets", url: "https://www.klook.com/en-MY/activity/1234-times-square-theme-park/" },
    ],
  },
];

export const comingSoonCountries = [
  "Thailand", "Indonesia", "Vietnam", "Philippines", "Singapore",
  "Japan", "South Korea", "India", "Sri Lanka", "Maldives",
  "Turkey", "Egypt", "Morocco", "UAE", "Jordan",
  "Italy", "Spain", "France", "Greece", "Portugal",
  "Mexico", "Brazil", "Peru", "Colombia", "Argentina",
  "Australia", "New Zealand", "Fiji",
];
