import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star, Sun, Search, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { allDestinations, comingSoonCountries } from "@/data/destinations";
import { useLanguage } from "@/contexts/LanguageContext";
import { publicListDestinations } from "@/lib/publicDestinationsApi";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const categories = ["All", "Nature", "Island", "City", "Cultural", "Entertainment"];

const BACKEND_ORIGIN = "http://localhost:5000";

function normalizeImageUrl(url: string | undefined | null) {
  if (!url) return "";
  const s = String(url);
  if (s.startsWith("/uploads/")) return `${BACKEND_ORIGIN}${s}`;
  return s;
}

const Destinations = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [votedCountries, setVotedCountries] = useState<string[]>([]);

  const [dynamicItems, setDynamicItems] = useState<typeof allDestinations>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await publicListDestinations({ limit: 200 });
        const mapped = (res.destinations || []).map((d) => {
          let tags: string[] = [];
          try {
            tags = d.tags ? JSON.parse(d.tags) : [];
            if (!Array.isArray(tags)) tags = [];
          } catch {
            tags = [];
          }

          let images: string[] = [];
          try {
            images = d.images ? JSON.parse(d.images) : [];
            if (!Array.isArray(images)) images = [];
          } catch {
            images = [];
          }

          const category = tags[0] || "City";

          return {
            id: d.slug,
            name: d.title,
            image: normalizeImageUrl(d.featured_image) || normalizeImageUrl(images[0]) || allDestinations[0]?.image,
            category,
            rating: 4.8,
            bestTime: d.subtitle || "Year-round",
            description: d.summary || "",
            overview: d.long_description || d.summary || "",
            attractions: tags.length ? tags : ["Attractions"],
            events: ["Local events"],
            reviews: 0,
            bookingLinks: [],
          };
        });
        setDynamicItems(mapped);
      } catch {
        setDynamicItems([]);
      }
    };

    run();
  }, []);

  const merged = useMemo(() => {
    const map = new Map<string, (typeof allDestinations)[number]>();
    for (const d of allDestinations) map.set(d.id, d);
    for (const d of dynamicItems) map.set(d.id, d);
    return Array.from(map.values());
  }, [dynamicItems]);

  const filtered = merged.filter((d) => {
    const matchCategory = activeCategory === "All" || d.category === activeCategory;
    const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleVote = (country: string) => {
    setVotedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  };

  // Sort coming soon countries by vote count (voted ones first)
  const sortedCountries = [...comingSoonCountries].sort((a, b) => {
    const aVoted = votedCountries.includes(a) ? 1 : 0;
    const bVoted = votedCountries.includes(b) ? 1 : 0;
    return bVoted - aVoted;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <motion.div initial="hidden" animate="visible" className="text-center mb-10">
            <motion.h1 custom={0} variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              {t("destinations.title")}
            </motion.h1>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
              Explore Malaysia's most stunning locations with AI-powered smart descriptions and travel insights.
            </motion.p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div initial="hidden" animate="visible" className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <motion.div custom={0} variants={fadeUp} className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("destinations.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </motion.div>
            <motion.div custom={1} variants={fadeUp} className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Destination Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filtered.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <Link to={`/destinations/${dest.id}`} className="group block">
                  <div className="bg-card rounded-xl overflow-hidden shadow-[var(--shadow-card)] border border-border card-lift">
                    <div className="relative h-52">
                      <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">{dest.category}</span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full glass-card">
                        <Star className="w-3 h-3 text-coral fill-coral" />
                        <span className="text-xs font-medium text-primary-foreground">{dest.rating}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-card-foreground mb-1">{dest.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Malaysia</span>
                        <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> {dest.bestTime}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{dest.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {dest.attractions.slice(0, 3).map((a) => (
                          <span key={a} className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px]">{a}</span>
                        ))}
                        {dest.attractions.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px]">+{dest.attractions.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 mb-16">
              <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">No destinations found.</p>
            </div>
          )}

          {/* Coming Soon Section */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="border-t border-border pt-12">
            <motion.div custom={0} variants={fadeUp} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 mb-4">
                <Globe className="w-4 h-4 text-coral" />
                <span className="text-sm font-medium text-coral">{t("destinations.coming")}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">{t("destinations.coming")}</h2>
              <p className="text-muted-foreground">{t("destinations.coming.desc")}</p>
              {votedCountries.length > 0 && (
                <p className="text-sm text-primary mt-2">You voted for {votedCountries.length} destination{votedCountries.length > 1 ? "s" : ""}!</p>
              )}
            </motion.div>

            <div className="flex flex-wrap gap-2 justify-center">
              {sortedCountries.map((country) => {
                const isVoted = votedCountries.includes(country);
                return (
                  <button
                    key={country}
                    onClick={() => toggleVote(country)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isVoted
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {isVoted && <Check className="w-3.5 h-3.5 inline mr-1" />}
                    {country}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Destinations;
