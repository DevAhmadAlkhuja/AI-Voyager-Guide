import { Link } from "react-router-dom";
import { Sparkles, MapPin, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logoImage from "@/assets/logo.png";
import "../syle.css"

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-ocean-deep text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center overflow-hidden shadow-lg">
                <img 
                  src={logoImage}  // استخدام الصورة المستوردة
                  alt="AI Voyager Guide Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-display text-lg font-bold text-white">
                AI Voyager <span className="text-teal-300">Guide</span>
              </span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed para " style={{color:"white"}}>
              Discover the world smarter with AI-powered travel planning and personalized recommendations.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 para">{t("nav.destinations")} </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70 para" style={{color:"white"}}>
              <li><Link to="/destinations" className="hover:text-primary-foreground transition-colors">{t("nav.destinations")}</Link></li>
              <li><Link to="/activities" className="hover:text-primary-foreground transition-colors">{t("nav.activities")}</Link></li>
              <li><Link to="/plan" className="hover:text-primary-foreground transition-colors">{t("nav.plan")}</Link></li>
              <li><Link to="/budget" className="hover:text-primary-foreground transition-colors">{t("nav.budget")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 para">Platform</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70 para" style={{color:"white"}}>
              <li><Link to="/chatbot" className="hover:text-primary-foreground transition-colors">{t("nav.chatbot")}</Link></li>
              <li><Link to="/instructions" className="hover:text-primary-foreground transition-colors">{t("nav.instructions")}</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground transition-colors">{t("nav.contact")}</Link></li>
              <li><Link to="/login" className="hover:text-primary-foreground transition-colors">{t("nav.login")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 para">{t("nav.contact")}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70 para" style={{color:"white"}}>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> aIvoyagerguide@gmail.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 0947738494</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Damascus , Syria</li>
            </ul>
          </div>
        </div>

        {/* Developers */}
        <div className="border-t border-primary-foreground/10 mt-8 pt-6 para" style={{color:"white"}}>
          <h4 className="font-display font-semibold mb-3 text-center">{t("developers")}</h4>
          <div className=" para flex flex-wrap justify-center gap-4 text-sm text-primary-foreground/70" style={{color:"white"}} >
            {["Ameera Al-Khyeami", "Abd Al-Rahman Sallouta", "Sarah Khaled", "Dima Al-Jaziyeh"].map((dev) => (
              <span key={dev} className="px-3 py-1 rounded-full border border-primary-foreground/20">{dev}</span>
            ))}
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-6 pt-6 text-center text-sm text-primary-foreground/50 " style={{color:"#e67f52"}}>
          {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
