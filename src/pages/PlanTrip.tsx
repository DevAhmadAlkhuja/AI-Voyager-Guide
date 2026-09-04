import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, DollarSign, Sparkles, Heart, Download, Share2, Utensils, Hotel, Camera, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { dispatchTripPlansChanged } from "@/lib/tripPlansEvents";

const tripTypes = ["Family", "Romantic", "Youthful", "Economical"];
const budgetLevels = ["Low", "Medium", "High"];
const interests = ["History", "Food", "Shopping", "Nature", "Adventure", "Relaxation"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

interface DayPlan {
  day: number;
  title: string;
  attractions: string[];
  hotel: string;
  restaurant: string;
  activities: string[];
  budget: string;
}

const generatePlan = (destination: string, days: number, tripType: string, budget: string, selectedInterests: string[]): DayPlan[] => {
  const attractionsByInterest: Record<string, string[]> = {
    History: ["National Museum", "Heritage Trail", "Historical Fort", "Old Town Walk"],
    Food: ["Street Food Tour", "Local Market Visit", "Cooking Class", "Night Market"],
    Shopping: ["Central Mall", "Artisan Market", "Souvenir Street", "Boutique District"],
    Nature: ["Botanical Garden", "Waterfall Hike", "Nature Reserve", "Scenic Viewpoint"],
    Adventure: ["Zipline Park", "Kayaking Tour", "Mountain Trail", "Rock Climbing"],
    Relaxation: ["Beach Day", "Spa & Wellness", "Sunset Cruise", "Tea House Visit"],
  };

  const hotels: Record<string, string[]> = {
    Low: ["Budget Inn", "Backpacker Hostel", "Guesthouse Stay"],
    Medium: ["City Hotel", "Boutique Hotel", "Comfort Suites"],
    High: ["Luxury Resort", "5-Star Hotel", "Premium Residence"],
  };

  const restaurants: Record<string, string[]> = {
    Low: ["Local Warung", "Street Food Stall", "Hawker Center"],
    Medium: ["Mid-Range Restaurant", "Café Bistro", "Family Diner"],
    High: ["Fine Dining", "Rooftop Restaurant", "Chef's Table"],
  };

  const budgetPerDay: Record<string, string> = { Low: "RM 80-150", Medium: "RM 200-400", High: "RM 500+" };

  return Array.from({ length: days }, (_, i) => {
    const dayInterests = selectedInterests.length > 0 ? selectedInterests : ["Nature", "Food"];
    const interestIdx = i % dayInterests.length;
    const interest = dayInterests[interestIdx];
    const attrs = attractionsByInterest[interest] || attractionsByInterest["Nature"];

    return {
      day: i + 1,
      title: `${interest} Exploration Day`,
      attractions: [attrs[i % attrs.length], attrs[(i + 1) % attrs.length]],
      hotel: hotels[budget]?.[i % hotels[budget].length] || "City Hotel",
      restaurant: restaurants[budget]?.[i % restaurants[budget].length] || "Local Café",
      activities: [`Morning: ${attrs[i % attrs.length]}`, `Afternoon: ${attrs[(i + 1) % attrs.length]}`, "Evening: Free Time"],
      budget: budgetPerDay[budget] || "RM 200-400",
    };
  });
};

const PlanTrip = () => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [tripType, setTripType] = useState("Family");
  const [budget, setBudget] = useState("Medium");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleSavePdf = () => {
    if (!plan || !destination) return;

    const safe = (s: string) =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const title = `Trip Plan: ${destination} (${days} days)`;
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${safe(title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      h1 { margin: 0 0 12px; font-size: 20px; }
      .meta { margin: 0 0 18px; font-size: 12px; color: #444; }
      .day { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 12px 0; }
      .day-title { font-weight: 700; margin: 0 0 8px; }
      .row { margin: 0 0 6px; font-size: 12px; }
      ul { margin: 6px 0 0 18px; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <h1>${safe(title)}</h1>
    <div class="meta">Trip type: ${safe(tripType)} • Budget level: ${safe(budget)} • Interests: ${safe(selectedInterests.join(", ") || "-")}</div>
    ${plan
      .map(
        (d) => `
      <div class="day">
        <div class="day-title">Day ${d.day}: ${safe(d.title)}</div>
        <div class="row"><strong>Attractions:</strong> ${safe(d.attractions.join(", "))}</div>
        <div class="row"><strong>Hotel:</strong> ${safe(d.hotel)}</div>
        <div class="row"><strong>Restaurant:</strong> ${safe(d.restaurant)}</div>
        <div class="row"><strong>Daily budget:</strong> ${safe(d.budget)}</div>
        <div class="row"><strong>Schedule:</strong></div>
        <ul>
          ${d.activities.map((a) => `<li>${safe(a)}</li>`).join("")}
        </ul>
      </div>`
      )
      .join("\n")}
    <script>
      window.onload = function () { window.print(); };
    </script>
  </body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    if (!destination) return;
    setIsGenerating(true);
    setSaveError(null);
    setSaveSuccess(null);

    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;

    try {
      if (token) {
        const payload = {
          trip_title: `${destination} • ${days} Days • ${tripType}`,
          destination,
          travelers_count: 1,
          contact_email: user?.email,
          contact_phone: user?.phone,
          special_requests: JSON.stringify({
            days,
            tripType,
            budgetLevel: budget,
            interests: selectedInterests,
          }),
          status: "planned",
        };

        const res = await fetch("http://localhost:5000/api/trip-plans", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSaveError(json?.message || "Failed to save trip plan");
        } else {
          setSaveSuccess("Trip plan saved to your dashboard");
          dispatchTripPlansChanged();
        }
      }
    } catch {
      if (token) setSaveError("Failed to reach backend");
    }

    setTimeout(() => {
      setPlan(generatePlan(destination, days, tripType, budget, selectedInterests));
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-8 section-padding">
        <div className="container mx-auto">
          <motion.div initial="hidden" animate="visible" className="text-center mb-12">
            <motion.h1 custom={0} variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Plan Your <span className="text-gradient-teal">Perfect Trip</span>
            </motion.h1>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
              Tell us your preferences and our AI will generate a personalized day-by-day travel plan.
            </motion.p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <motion.div initial="hidden" animate="visible" className="bg-card rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)] border border-border space-y-6">
              {/* Destination */}
              <motion.div custom={0} variants={fadeUp}>
                <label className="flex items-center gap-2 text-sm font-medium text-card-foreground mb-2">
                  <MapPin className="w-4 h-4 text-primary" /> Destination
                </label>
                <input
                  type="text"
                  placeholder="e.g., Kuala Lumpur, Penang, Langkawi..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </motion.div>

              {/* Days */}
              <motion.div custom={1} variants={fadeUp}>
                <label className="flex items-center gap-2 text-sm font-medium text-card-foreground mb-2">
                  <Calendar className="w-4 h-4 text-primary" /> Number of Days
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 5, 7].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        days === d ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {d} {d === 1 ? "Day" : "Days"}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Trip Type */}
              <motion.div custom={2} variants={fadeUp}>
                <label className="flex items-center gap-2 text-sm font-medium text-card-foreground mb-2">
                  <Users className="w-4 h-4 text-primary" /> Trip Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {tripTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTripType(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tripType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Budget */}
              <motion.div custom={3} variants={fadeUp}>
                <label className="flex items-center gap-2 text-sm font-medium text-card-foreground mb-2">
                  <DollarSign className="w-4 h-4 text-primary" /> Budget Level
                </label>
                <div className="flex gap-2">
                  {budgetLevels.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBudget(b)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        budget === b ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Interests */}
              <motion.div custom={4} variants={fadeUp}>
                <label className="flex items-center gap-2 text-sm font-medium text-card-foreground mb-2">
                  <Heart className="w-4 h-4 text-coral" /> Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedInterests.includes(interest)
                          ? "bg-coral text-accent-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div custom={5} variants={fadeUp}>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full text-base py-6"
                  onClick={handleGenerate}
                  disabled={!destination || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" /> Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Generate AI Travel Plan
                    </>
                  )}
                </Button>
                {saveError && <p className="text-sm text-destructive mt-3">{saveError}</p>}
                {saveSuccess && <p className="text-sm text-foreground mt-3">{saveSuccess}</p>}
              </motion.div>
            </motion.div>

            {/* Generated Plan */}
            {plan && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-10"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    Your {days}-Day {destination} Plan
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSavePdf}>
                      <Download className="w-4 h-4" /> Save PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" /> Share
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {plan.map((day) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: day.day * 0.1 }}
                      className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold">
                          {day.day}
                        </div>
                        <h3 className="font-display font-semibold text-lg text-card-foreground">{day.title}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Camera className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase">Attractions</p>
                              <p className="text-sm text-card-foreground">{day.attractions.join(", ")}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Hotel className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase">Hotel</p>
                              <p className="text-sm text-card-foreground">{day.hotel}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Utensils className="w-4 h-4 text-coral mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase">Restaurant</p>
                              <p className="text-sm text-card-foreground">{day.restaurant}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Wallet className="w-4 h-4 text-coral mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase">Daily Budget</p>
                              <p className="text-sm text-card-foreground">{day.budget}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Schedule</p>
                        <div className="flex flex-wrap gap-2">
                          {day.activities.map((act, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlanTrip;
