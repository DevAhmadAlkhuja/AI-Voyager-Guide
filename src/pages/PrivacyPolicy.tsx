import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePageMeta } from "@/lib/usePageMeta";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function PrivacyPolicy() {
  usePageMeta({
    title: "Privacy Policy — AI Voyager",
    description: "Learn how AI Voyager collects, uses, and protects your personal information.",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 section-padding">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial="hidden" animate="visible" className="text-center mb-10">
            <motion.h1 custom={0} variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Privacy Policy — AI Voyager
            </motion.h1>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto">
              AI Voyager values user privacy and is committed to transparent, responsible handling of personal information.
            </motion.p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                h: "1. Introduction",
                p: "This Privacy Policy explains how AI Voyager collects, uses, and protects information when you use our platform and services.",
              },
              {
                h: "2. Information We Collect",
                p: "We may collect account information, booking details, payment processing information (handled securely via providers), usage data and analytics, and device/technical data.",
              },
              {
                h: "3. How We Use Information",
                p: "We use information to provide booking services, improve AI recommendations, support customers, prevent fraud, and comply with legal obligations.",
              },
              {
                h: "4. Legal Basis for Processing",
                p: "We process personal data based on contract performance, user consent, legal obligations, and legitimate interests such as improving service quality and security.",
              },
              {
                h: "5. Data Sharing",
                p: "We may share data with payment processors, hosting providers, and travel partners for booking fulfillment. We may also disclose information to legal authorities when required by law.",
              },
              {
                h: "6. Data Security",
                p: "We use encryption, hashed passwords, limited internal access controls, and security monitoring practices designed to protect user information.",
              },
              {
                h: "7. Cookies & Tracking",
                p: "We may use cookies and similar technologies to enable essential functionality, measure analytics, and personalize your experience. You can manage cookie preferences through your browser settings.",
              },
              {
                h: "8. User Rights",
                p: "Depending on your location, you may have rights to access, correct, delete, restrict processing, or request portability of your personal data.",
              },
              {
                h: "9. Data Retention",
                p: "We retain personal information only as long as necessary for service delivery and legal requirements. Booking and related records are generally retained for 3–7 years depending on regulatory obligations.",
              },
              {
                h: "10. Policy Updates",
                p: "We may update this policy from time to time. If we make significant changes, we will provide notice through the platform or other appropriate channels.",
              },
              {
                h: "11. Contact Information",
                p: "For privacy questions or requests, contact: privacy@aivoyager.example",
              },
            ].map((s) => (
              <motion.section
                key={s.h}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0}
                variants={fadeUp}
                className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border"
              >
                <h2 className="font-display font-semibold text-card-foreground mb-2">{s.h}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.p}</p>
              </motion.section>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
