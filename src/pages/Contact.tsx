import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

const developers = [
  { name: "Ameera Al-Khyeami", role: "Project Lead & Full-Stack Developer" },
  { name: "Abd Al-Rahman Sallouta", role: "Backend & AI Integration" },
  { name: "Sarah Khaled", role: "Frontend & UI/UX Designer" },
  { name: "Dima Al-Jaziyeh", role: "Content & QA Specialist" },
];

const Contact = () => {
  const { t } = useLanguage();
  const token = localStorage.getItem("token");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState("General");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSuccess(null);

    try {
      const isAuthed = Boolean(token);
      const url = isAuthed ? "http://localhost:5000/api/contact/auth" : "http://localhost:5000/api/contact";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          ...(isAuthed ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, topic, message }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.message || "Failed to send message");
        return;
      }

      setSuccess("Message sent");
      setMessage("");
    } catch {
      setError("Failed to reach backend");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial="hidden" animate="visible" className="text-center mb-12">
            <motion.h1 custom={0} variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              {t("contact.title")}
            </motion.h1>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground">
              {t("contact.subtitle")}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Contact Info */}
            <motion.div initial="hidden" animate="visible" className="space-y-6">
              <motion.div custom={0} variants={fadeUp} className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Phone</p>
                    <p className="text-sm text-muted-foreground">0949979121</p>
                  </div>
                </div>
              </motion.div>

              <motion.div custom={1} variants={fadeUp} className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-coral" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">ameeraalkhyeami@gmail.com</p>
                  </div>
                </div>
              </motion.div>

              <motion.div custom={2} variants={fadeUp} className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">Kuala Lumpur, Malaysia</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
              <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border space-y-4">
                <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
                <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
                <input type="text" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
                <textarea placeholder="Your Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none" />
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-primary">{success}</p>}
                <Button variant="hero" className="w-full" onClick={submit}>
                  <Send className="w-4 h-4" /> Send Message
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Developers */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 custom={0} variants={fadeUp} className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-8">
              {t("developers")}
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {developers.map((dev, i) => (
                <motion.div
                  key={dev.name}
                  custom={i}
                  variants={fadeUp}
                  className="bg-card rounded-xl p-5 text-center shadow-[var(--shadow-card)] border border-border card-lift"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-card-foreground text-sm">{dev.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{dev.role}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
