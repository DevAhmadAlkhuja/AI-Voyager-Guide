import { useState } from "react";
import { motion } from "framer-motion";
import { Mountain, Waves, Users, Palette, Timer, DollarSign, User, Search, Filter, MapPin, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import jungleTrekking from "@/assets/Jungle Trekking.png";
import rockClimbing from "@/assets/Rock Climbing.png";
import whiteWaterRafting from "@/assets/White Water Rafting.png";
import scubaDiving from "@/assets/Scuba Diving.png";
import spaWellnessRetreat from "@/assets/Spa & Wellness Retreat.png";
import beachYoga from "@/assets/Beach Yoga.png";
import sunsetCruise from "@/assets/Sunset Cruise.png";
import themeParkDay from "@/assets/Theme Park Day.png";
import wildlifeSafari from "@/assets/Wildlife Safari.png";
import cookingClass from "@/assets/Cooking Class.png";
import heritageWalkingTour from "@/assets/Heritage Walking Tour.png";
import batikPaintingWorkshop from "@/assets/Batik Painting Workshop.png";
import traditionalDanceShow from "@/assets/Traditional Dance Show.png";const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const categoryIcons: Record<string, typeof Mountain> = {
  Adventure: Mountain,
  Relaxation: Waves,
  Family: Users,
  Cultural: Palette,
};

// استخدام الصور المحلية من مجلد assets
const activityImages: Record<string, string> = {
  "Jungle Trekking": jungleTrekking,
  "Rock Climbing": rockClimbing,
  "White Water Rafting": whiteWaterRafting,
  "Scuba Diving": scubaDiving,
  "Spa & Wellness Retreat": spaWellnessRetreat,
  "Beach Yoga": beachYoga,
  "Sunset Cruise": sunsetCruise,
  "Theme Park Day": themeParkDay,
  "Wildlife Safari": wildlifeSafari,
  "Cooking Class": cookingClass,
  "Heritage Walking Tour": heritageWalkingTour,
  "Batik Painting Workshop": batikPaintingWorkshop,
  "Traditional Dance Show": traditionalDanceShow,
};

const allActivities = [
  { 
    name: "Jungle Trekking", 
    category: "Adventure", 
    difficulty: "Hard", 
    duration: "4-6 hours", 
    price: "RM 80-150", 
    ageGroup: "16-55", 
    description: "Navigate through dense tropical rainforest with expert guides, crossing streams and discovering exotic wildlife.", 
    fitness: "High", 
    weather: "Dry" 
  },
  { 
    name: "Rock Climbing", 
    category: "Adventure", 
    difficulty: "Hard", 
    duration: "3-4 hours", 
    price: "RM 120-200", 
    ageGroup: "14-45", 
    description: "Scale limestone cliffs with professional gear and certified instructors at Malaysia's top climbing spots.", 
    fitness: "High", 
    weather: "Dry" 
  },
  { 
    name: "White Water Rafting", 
    category: "Adventure", 
    difficulty: "Medium", 
    duration: "3-5 hours", 
    price: "RM 150-250", 
    ageGroup: "12-55", 
    description: "Ride thrilling rapids through scenic river valleys surrounded by lush tropical greenery.", 
    fitness: "Medium", 
    weather: "Any" 
  },
  { 
    name: "Scuba Diving", 
    category: "Adventure", 
    difficulty: "Medium", 
    duration: "Half day", 
    price: "RM 200-400", 
    ageGroup: "12-60", 
    description: "Explore vibrant coral reefs and encounter marine life at world-class dive sites.", 
    fitness: "Medium", 
    weather: "Calm" 
  },
  { 
    name: "Spa & Wellness Retreat", 
    category: "Relaxation", 
    difficulty: "Easy", 
    duration: "2-4 hours", 
    price: "RM 150-500", 
    ageGroup: "18+", 
    description: "Indulge in traditional Malay massage, herbal treatments, and holistic wellness therapies.", 
    fitness: "Low", 
    weather: "Any" 
  },
  { 
    name: "Beach Yoga", 
    category: "Relaxation", 
    difficulty: "Easy", 
    duration: "1-2 hours", 
    price: "RM 30-80", 
    ageGroup: "All ages", 
    description: "Start your morning with guided yoga sessions on pristine sandy beaches at sunrise.", 
    fitness: "Low", 
    weather: "Clear" 
  },
  { 
    name: "Sunset Cruise", 
    category: "Relaxation", 
    difficulty: "Easy", 
    duration: "2-3 hours", 
    price: "RM 100-300", 
    ageGroup: "All ages", 
    description: "Sail along the coast and enjoy stunning Malaysian sunsets with refreshments on board.", 
    fitness: "Low", 
    weather: "Clear" 
  },
  { 
    name: "Theme Park Day", 
    category: "Family", 
    difficulty: "Easy", 
    duration: "Full day", 
    price: "RM 80-200", 
    ageGroup: "All ages", 
    description: "Enjoy thrilling rides, shows, and attractions at Malaysia's top family-friendly theme parks.", 
    fitness: "Low", 
    weather: "Any" 
  },
  { 
    name: "Wildlife Safari", 
    category: "Family", 
    difficulty: "Easy", 
    duration: "3-4 hours", 
    price: "RM 60-120", 
    ageGroup: "All ages", 
    description: "Encounter elephants, tigers, and exotic birds in well-maintained natural habitats.", 
    fitness: "Low", 
    weather: "Any" 
  },
  { 
    name: "Cooking Class", 
    category: "Family", 
    difficulty: "Easy", 
    duration: "3-4 hours", 
    price: "RM 100-180", 
    ageGroup: "6+", 
    description: "Learn to prepare authentic Malaysian dishes like nasi lemak, rendang, and satay.", 
    fitness: "Low", 
    weather: "Any" 
  },
  { 
    name: "Heritage Walking Tour", 
    category: "Cultural", 
    difficulty: "Easy", 
    duration: "2-3 hours", 
    price: "RM 40-80", 
    ageGroup: "All ages", 
    description: "Discover centuries of history through guided walks past temples, mosques, and colonial architecture.", 
    fitness: "Medium", 
    weather: "Any" 
  },
  { 
    name: "Batik Painting Workshop", 
    category: "Cultural", 
    difficulty: "Easy", 
    duration: "2-3 hours", 
    price: "RM 50-100", 
    ageGroup: "6+", 
    description: "Create your own traditional batik art using wax-resist dyeing techniques passed down through generations.", 
    fitness: "Low", 
    weather: "Any" 
  },
  { 
    name: "Traditional Dance Show", 
    category: "Cultural", 
    difficulty: "Easy", 
    duration: "1-2 hours", 
    price: "RM 30-60", 
    ageGroup: "All ages", 
    description: "Watch mesmerizing performances of Malay, Chinese, and Indian traditional dances.", 
    fitness: "Low", 
    weather: "Any" 
  },
];

const categoryFilters = ["All", "Adventure", "Relaxation", "Family", "Cultural"];
const fitnessFilters = ["All", "Low", "Medium", "High"];

const Activities = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [fitnessLevel, setFitnessLevel] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

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

  const filtered = allActivities.filter((a) => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchFit = fitnessLevel === "All" || a.fitness === fitnessLevel;
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchFit && matchSearch;
  });

  const getDifficultyColor = (d: string) => {
    if (d === "Easy") return "bg-primary/10 text-primary";
    if (d === "Medium") return "bg-coral/10 text-coral";
    return "bg-destructive/10 text-destructive";
  };

  // دالة لفتح الصورة بالحجم الكامل
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // دالة لإغلاق الصورة
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // دالة لمعالجة تحميل الصورة
  const handleImageLoad = (activityName: string) => {
    setLoadingImages(prev => ({ ...prev, [activityName]: false }));
  };

  // دالة لمعالجة خطأ تحميل الصورة
  const handleImageError = (activityName: string) => {
    setLoadingImages(prev => ({ ...prev, [activityName]: false }));
    console.error(`Failed to load image for: ${activityName}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Modal للصورة بالحجم الكامل */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeImageModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Full size activity"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
            >
              ✕
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
              Click outside to close
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <motion.div initial="hidden" animate="visible" className="text-center mb-10">
            <motion.h1 custom={0} variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Activities & <span className="text-gradient-teal">Experiences</span>
            </motion.h1>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
              From thrilling adventures to peaceful retreats — find the perfect activity for your trip.
            </motion.p>
          </motion.div>

          {/* Filters */}
          <motion.div initial="hidden" animate="visible" className="space-y-4 mb-8">
            <motion.div custom={0} variants={fadeUp} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {categoryFilters.map((cat) => (
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
              </div>
            </motion.div>

            <motion.div custom={1} variants={fadeUp} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Fitness:</span>
              {fitnessFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFitnessLevel(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    fitnessLevel === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {f}
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((activity, i) => {
              const Icon = categoryIcons[activity.category] || Mountain;
              const imageUrl = activityImages[activity.name] || "/assets/placeholder.png";
              const isLoading = loadingImages[activity.name] !== false;
              
              return (
                <motion.div
                  key={activity.name}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="bg-card rounded-xl overflow-hidden shadow-[var(--shadow-card)] border border-border card-lift group"
                >
                  {/* صورة النشاط */}
                  <div 
                    className="relative h-48 overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-800" 
                    onClick={() => openImageModal(imageUrl)}
                  >
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    <img
                      src={imageUrl}
                      alt={activity.name}
                      className={`w-full h-full object-cover transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-105'}`}
                      loading="lazy"
                      onLoad={() => handleImageLoad(activity.name)}
                      onError={() => handleImageError(activity.name)}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    
                    {/* زر عرض الصورة بالحجم الكامل */}
                    <button
                      className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageModal(imageUrl);
                      }}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    
                    {/* بطاقة الفئة */}
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{activity.category}</span>
                      </div>
                    </div>
                    
                    {/* بطاقة الصعوبة */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                        {activity.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* محتوى البطاقة */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display font-semibold text-lg text-card-foreground leading-tight">{activity.name}</h3>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{activity.description}</p>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Timer className="w-3.5 h-3.5" />
                        <span>{activity.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{activity.price}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        <span>{activity.ageGroup}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{activity.weather} weather</span>
                      </div>
                    </div>

                    {/* شريط معلومات إضافية */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs font-medium text-primary">Fitness: {activity.fitness}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Best in {activity.weather}</span>
                      </div>
                    </div>

                    {/* أزرار الإجراء */}
                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => console.log(`View details for ${activity.name}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={goBookNow}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Mountain className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">No activities found. Try adjusting your filters.</p>
            </div>
          )}

          {/* إحصاءات */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{allActivities.length}</p>
                <p className="text-sm text-muted-foreground">Total Activities</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-500">
                  {allActivities.filter(a => a.category === "Adventure").length}
                </p>
                <p className="text-sm text-muted-foreground">Adventure Activities</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">
                  {allActivities.filter(a => a.category === "Relaxation").length}
                </p>
                <p className="text-sm text-muted-foreground">Relaxation Options</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">
                  {allActivities.filter(a => a.category === "Cultural").length}
                </p>
                <p className="text-sm text-muted-foreground">Cultural Experiences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Activities;