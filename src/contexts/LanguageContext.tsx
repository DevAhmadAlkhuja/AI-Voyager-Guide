import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.plan": "Plan Your Trip",
    "nav.destinations": "Destinations",
    "nav.activities": "Activities",
    "nav.contact": "Contact Us",
    "nav.instructions": "Instructions",
    "nav.chatbot": "Chatbot",
    "nav.login": "Log In",
    "nav.budget": "Budget Tracker",
    "hero.badge": "Powered by Artificial Intelligence",
    "hero.title": "Plan Your Perfect Trip with Artificial Intelligence",
    "hero.desc": "Discover destinations, generate personalized travel plans, and explore AI-generated visuals — all in one smart tourism platform.",
    "hero.plan": "Plan Your Trip",
    "hero.chat": "Contact Us",
    "about.title": "Smart Travel, Simplified",
    "about.desc": "Our AI-powered platform combines cutting-edge technology with deep travel knowledge to create unforgettable experiences.",
    "about.vision": "Our Vision:",
    "about.vision.text": "To revolutionize tourism through artificial intelligence, making travel planning accessible, personalized, and enjoyable for everyone.",
    "about.tech": "Technologies:",
    "about.tech.text": "Built with React, TypeScript, and AI-powered recommendation engines.",
    "about.future": "Future Plans:",
    "about.future.text": "AR destination previews, real-time translation, and community-driven travel content powered by AI curation.",
    "destinations.title": "Trips & Destinations",
    "destinations.search": "Search destinations...",
    "destinations.coming": "Coming Soon",
    "destinations.coming.desc": "Vote for destinations you'd like to explore next!",
    "activities.title": "Activities & Experiences",
    "reviews.title": "What Travelers Say",
    "cta.title": "Ready to Start Your Adventure?",
    "cta.desc": "Let our AI plan the perfect trip for you — personalized, budget-friendly, and unforgettable.",
    "cta.btn": "Start Planning",
    "contact.title": "Contact Us",
    "contact.subtitle": "Get in touch with our team",
    "instructions.title": "How to Use",
    "instructions.subtitle": "Complete guide to using the AI Voyager Guide platform",
    "budget.title": "Budget Tracker",
    "budget.subtitle": "Track your travel expenses",
    "footer.rights": "© 2026 AI Voyager Guide. All rights reserved.",
    "developers": "Our Developers",
    "popular": "Popular Destinations",
    "popular.desc": "Explore Malaysia's most captivating locations",
    "view.all": "View All",
    "detail.overview": "Cultural & Historical Overview",
    "detail.attractions": "Top Attractions",
    "detail.reviews": "Reviews & Ratings",
    "detail.gallery": "Image Gallery",
    "detail.events": "Famous Events & Activities",
    "detail.book": "Book Now",
    "detail.booking": "External Booking Links",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.plan": "خطط رحلتك",
    "nav.destinations": "الوجهات",
    "nav.activities": "الأنشطة",
    "nav.contact": "اتصل بنا",
    "nav.instructions": "التعليمات",
    "nav.chatbot": "المساعد الذكي",
    "nav.login": "تسجيل الدخول",
    "nav.budget": "تتبع الميزانية",
    "hero.badge": "مدعوم بالذكاء الاصطناعي",
    "hero.title": "خطط لرحلتك المثالية مع الذكاء الاصطناعي",
    "hero.desc": "اكتشف الوجهات، وأنشئ خطط سفر مخصصة، واستكشف المحتوى المرئي المولد بالذكاء الاصطناعي.",
    "hero.plan": "خطط لرحلتك",
    "hero.chat": "تواصل معنا",
    "about.title": "سفر ذكي، مبسط",
    "about.desc": "منصتنا المدعومة بالذكاء الاصطناعي تجمع بين التكنولوجيا المتقدمة والمعرفة العميقة بالسفر.",
    "about.vision": "رؤيتنا:",
    "about.vision.text": "إحداث ثورة في السياحة من خلال الذكاء الاصطناعي.",
    "about.tech": "التقنيات:",
    "about.tech.text": "مبني بـ React وTypeScript ومحركات التوصية الذكية.",
    "about.future": "خطط مستقبلية:",
    "about.future.text": "معاينات الواقع المعزز والترجمة الفورية.",
    "destinations.title": "الرحلات والوجهات",
    "destinations.search": "ابحث عن الوجهات...",
    "destinations.coming": "قريباً",
    "destinations.coming.desc": "صوّت للوجهات التي تريد استكشافها!",
    "activities.title": "الأنشطة والتجارب",
    "reviews.title": "ماذا يقول المسافرون",
    "cta.title": "مستعد لبدء مغامرتك؟",
    "cta.desc": "دع الذكاء الاصطناعي يخطط الرحلة المثالية لك.",
    "cta.btn": "ابدأ التخطيط",
    "contact.title": "اتصل بنا",
    "contact.subtitle": "تواصل مع فريقنا",
    "instructions.title": "كيفية الاستخدام",
    "instructions.subtitle": "دليل شامل لاستخدام منصة دليل السياحة الذكي",
    "budget.title": "تتبع الميزانية",
    "budget.subtitle": "تتبع نفقات سفرك",
    "footer.rights": "© 2026 دليل السياحة الذكي. جميع الحقوق محفوظة.",
    "developers": "المطورون",
    "popular": "الوجهات الشائعة",
    "popular.desc": "استكشف أجمل مواقع ماليزيا",
    "view.all": "عرض الكل",
    "detail.overview": "نظرة ثقافية وتاريخية",
    "detail.attractions": "أهم المعالم",
    "detail.reviews": "التقييمات والمراجعات",
    "detail.gallery": "معرض الصور",
    "detail.events": "الفعاليات والأنشطة الشهيرة",
    "detail.book": "احجز الآن",
    "detail.booking": "روابط الحجز الخارجية",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "ar" ? "ar" : "en") as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => translations[language]?.[key] || key;
  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
