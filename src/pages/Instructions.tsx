import { motion } from "framer-motion";
import { MapPin, MessageCircle, Sparkles, Download, Mic, BookOpen, Compass, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const steps = [
  {
    icon: Compass,
    title: "Explore Destinations",
    desc: "Browse our curated collection of Malaysian destinations. Use filters by category (Nature, City, Cultural, Island, Entertainment) to find your ideal spot. Click on any destination card to view detailed information including cultural overview, attractions, events, reviews, and booking links.",
  },
  {
    icon: Calendar,
    title: "Generate AI Travel Plans",
    desc: "Go to 'Plan Your Trip' and fill in your preferences: destination, number of days, trip type (Family/Romantic/Youthful/Economical), budget level, and interests. Click 'Generate AI Travel Plan' and receive a day-by-day itinerary with attractions, hotels, restaurants, activities, and budget allocation.",
  },
  {
    icon: MessageCircle,
    title: "Use the AI Chatbot",
    desc: "Navigate to the Chatbot page for instant travel assistance. Ask about destinations, food recommendations, budget tips, family activities, or adventure options. Use the quick suggestion buttons for common queries or type your own questions.",
  },
  {
    icon: Mic,
    title: "Voice Assistant (Coming Soon)",
    desc: "Soon you'll be able to interact with the platform using voice commands. Ask travel questions, navigate the platform, and get recommendations hands-free. This feature will be available once backend integration is complete.",
  },
  {
    icon: Download,
    title: "Save & Share Trips",
    desc: "After generating a travel plan, use the 'Save PDF' button to download your itinerary. Share your plans with travel companions using the 'Share' button. Sign up for an account to save trips to your dashboard for future reference.",
  },
  {
    icon: MapPin,
    title: "Track Your Budget",
    desc: "Use the Budget Tracker to monitor your travel expenses. Add expenses by category (food, transport, accommodation, activities), set a total budget, and view spending summaries with visual charts. Compare your actual spending with your planned budget.",
  },
  {
    icon: BookOpen,
    title: "Rate & Review",
    desc: "After visiting a destination, leave your rating and review to help other travelers. Rate destinations, activities, and your overall experience. Your reviews contribute to the community and help improve AI recommendations.",
  },
  {
    icon: Sparkles,
    title: "Coming Soon Features",
    desc: "Vote for future destinations in the 'Coming Soon' section. Upcoming features include real-time weather integration, interactive maps, offline trip access, smart notifications, loyalty rewards program, and affiliate travel deals.",
  },
];

const Instructions = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial="hidden" animate="visible" className="text-center mb-12">
            <motion.h1 custom={0} variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              {t("instructions.title")}
            </motion.h1>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
              {t("instructions.subtitle")}
            </motion.p>
          </motion.div>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon className="w-5 h-5 text-primary" />
                      <h3 className="font-display font-semibold text-card-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Instructions;
