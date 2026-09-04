import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star, Sun, ArrowLeft, ExternalLink, Calendar, Camera, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { allDestinations } from "@/data/destinations";
import { useLanguage } from "@/contexts/LanguageContext";
import { allActivities } from "@/data/activities";
import { publicGetDestination } from "@/lib/publicDestinationsApi";

const BACKEND_ORIGIN = "http://localhost:5000";

function normalizeImageUrl(url: string | undefined | null) {
  if (!url) return "";
  const s = String(url);
  if (s.startsWith("/uploads/")) return `${BACKEND_ORIGIN}${s}`;
  return s;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
}

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const staticDest = allDestinations.find((d) => d.id === id);
  const [apiDest, setApiDest] = useState<any | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      if (staticDest) {
        setApiDest(null);
        return;
      }

      try {
        const d = await publicGetDestination(id);

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

        setApiDest({
          id: d.slug,
          name: d.title,
          image: normalizeImageUrl(d.featured_image) || normalizeImageUrl(images[0]) || "",
          category: tags[0] || "City",
          rating: 4.8,
          bestTime: d.subtitle || "Year-round",
          description: d.summary || "",
          overview: d.long_description || d.summary || "",
          attractions: tags.length ? tags : ["Attractions"],
          events: ["Local events"],
          reviews: 0,
          bookingLinks: [],
        });
      } catch {
        setApiDest(null);
      }
    };

    run();
  }, [id, staticDest]);

  const dest = staticDest || apiDest;

  const goBookNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await fetch("http://localhost:5000/api/tracking/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
    } catch {
      // ignore tracking errors
    }

    navigate("/dashboard/bookings");
  };

  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<Review[]>([
    { name: "Ali Hassan", rating: 5, text: "Absolutely breathtaking! One of the best experiences of my life.", date: "2026-01-15" },
    { name: "Maria Chen", rating: 4, text: "Beautiful place, well maintained. Would recommend visiting early morning to avoid crowds.", date: "2026-01-10" },
    { name: "David Kim", rating: 5, text: "The cultural heritage here is incredible. A must-visit for history lovers.", date: "2025-12-28" },
  ]);

  if (!dest) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 section-padding text-center">
          <p className="text-muted-foreground">Destination not found.</p>
          <Button variant="default" className="mt-4" asChild>
            <Link to="/destinations">Back to Destinations</Link>
          </Button>
        </div>
      </div>
    );
  }

  const submitReview = () => {
    if (!reviewText || !userRating) return;
    setReviews((prev) => [
      { name: "You", rating: userRating, text: reviewText, date: new Date().toISOString().split("T")[0] },
      ...prev,
    ]);
    setReviewText("");
    setUserRating(0);
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : dest.rating;

  const recommendedActivities = allActivities
    .filter((a) => {
      const cat = (dest.category || "").toLowerCase();
      if (cat.includes("nature") || cat.includes("island")) return a.category === "Adventure" || a.category === "Relaxation";
      if (cat.includes("city") || cat.includes("cultural")) return a.category === "Cultural" || a.category === "Family";
      if (cat.includes("entertainment")) return a.category === "Family";
      return true;
    })
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative h-[50vh] min-h-[350px] flex items-end overflow-hidden">
        <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="relative z-10 container mx-auto px-4 pb-8">
          <Link to="/destinations" className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Destinations
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium mb-3">{dest.category}</span>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground">{dest.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-primary-foreground/80 text-sm">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Malaysia</span>
                <span className="flex items-center gap-1"><Sun className="w-4 h-4" /> Best: {dest.bestTime}</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-coral fill-coral" /> {avgRating.toFixed(1)} ({dest.reviews + reviews.length})</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-padding">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
                <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> {t("detail.overview")}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{dest.overview}</p>
              </motion.div>

              {/* Attractions */}
              <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
                <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" /> {t("detail.attractions")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dest.attractions.map((attr, i) => (
                    <div key={attr} className="bg-card rounded-lg p-4 border border-border flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium text-card-foreground">{attr}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Events */}
              <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
                <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-coral" /> {t("detail.events")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {dest.events.map((event) => (
                    <span key={event} className="px-4 py-2 rounded-lg bg-coral/10 text-coral text-sm font-medium">{event}</span>
                  ))}
                </div>
              </motion.div>

              {/* Activities */}
              <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
                <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Recommended Activities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedActivities.map((a) => (
                    <div key={a.name} className="bg-card rounded-xl overflow-hidden shadow-[var(--shadow-card)] border border-border card-lift">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{a.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{a.category} • {a.difficulty} • {a.duration}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{a.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{a.description}</p>
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">Fitness: {a.fitness}</span>
                          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">Weather: {a.weather}</span>
                          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">Age: {a.ageGroup}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={goBookNow}>
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Reviews */}
              <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
                <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-coral" /> {t("detail.reviews")}
                </h2>

                {/* Write Review */}
                <div className="bg-card rounded-xl p-5 border border-border mb-4">
                  <p className="text-sm font-medium text-card-foreground mb-2">Write a Review</p>
                  <StarRating rating={userRating} onRate={setUserRating} interactive size="md" />
                  <textarea
                    placeholder="Share your experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    className="w-full mt-3 px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                  />
                  <Button variant="default" size="sm" className="mt-2" onClick={submitReview} disabled={!userRating || !reviewText}>
                    Submit Review
                  </Button>
                </div>

                {/* Review List */}
                <div className="space-y-3">
                  {reviews.map((review, i) => (
                    <div key={i} className="bg-card rounded-lg p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-card-foreground">{review.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Booking Links */}
              <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] border border-border">
                <h3 className="font-display font-semibold text-card-foreground mb-3">{t("detail.booking")}</h3>
                <div className="space-y-2">
                  {dest.bookingLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                    >
                      <span className="text-card-foreground font-medium">{link.label}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
                <Button variant="coral" className="w-full mt-3">
                  {t("detail.book")}
                </Button>
              </motion.div>

              {/* Quick Info */}
              <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] border border-border">
                <h3 className="font-display font-semibold text-card-foreground mb-3">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium text-card-foreground">{dest.category}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Best Time</span><span className="font-medium text-card-foreground">{dest.bestTime}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="font-medium text-card-foreground">{avgRating.toFixed(1)}/5</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Reviews</span><span className="font-medium text-card-foreground">{dest.reviews + reviews.length}</span></div>
                </div>
              </motion.div>

              {/* Weather Placeholder */}
              <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] border border-border">
                <h3 className="font-display font-semibold text-card-foreground mb-3">🌤️ Weather</h3>
                <p className="text-sm text-muted-foreground mb-2">Current conditions (simulated)</p>
                <div className="text-center py-3">
                  <span className="text-3xl font-display font-bold text-card-foreground">28°C</span>
                  <p className="text-sm text-muted-foreground mt-1">Partly Cloudy • Humidity 78%</p>
                </div>
                <p className="text-xs text-muted-foreground text-center italic">Live weather data coming soon</p>
              </motion.div>

              {/* Map Placeholder */}
              <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] border border-border">
                <h3 className="font-display font-semibold text-card-foreground mb-3">📍 Map</h3>
                <div className="h-40 rounded-lg bg-secondary flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Interactive map coming soon</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DestinationDetail;
