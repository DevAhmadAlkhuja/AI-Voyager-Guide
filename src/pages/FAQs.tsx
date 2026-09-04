import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePageMeta } from "@/lib/usePageMeta";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function FAQs() {
  usePageMeta({
    title: "FAQs — AI Voyager",
    description: "Find answers to common questions about booking, payments, AI recommendations, and account management on AI Voyager.",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 section-padding">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial="hidden" animate="visible" className="text-center mb-10">
            <motion.h1 custom={0} variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              FAQs — AI Voyager
            </motion.h1>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto">
              Welcome to the AI Voyager FAQ section. Here you will find answers to the most common questions regarding bookings, payments, AI-powered
              recommendations, and account management.
            </motion.p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "1. How do I book a trip?",
                a: "Browse destinations, select a trip or activity stage, and complete your booking by entering traveler details and confirming payment.",
              },
              {
                q: "2. Can I modify or cancel my booking?",
                a: "Changes depend on the trip provider’s cancellation policy. Some modifications or cancellations may include fees based on timing and availability.",
              },
              {
                q: "3. What payment methods are supported?",
                a: "We support major credit cards and supported online payment gateways. Available methods may vary by region and provider.",
              },
              {
                q: "4. How does AI recommendation work?",
                a: "We analyze user preferences, on-platform behavior, and booking history (when available) to suggest relevant destinations and travel experiences.",
              },
              {
                q: "5. Is my data secure?",
                a: "Yes. We use encrypted connections and secure storage practices to protect your information and reduce unauthorized access risks.",
              },
              {
                q: "6. Can I book without creating an account?",
                a: "Guest booking may be available, but creating an account helps you track bookings, access invoices, and receive more personalized recommendations.",
              },
              {
                q: "7. How do I contact support?",
                a: "You can reach us through the Contact page or via our support email. We aim to respond as quickly as possible during business hours.",
              },
              {
                q: "8. How do I download invoices?",
                a: "Invoices (when available) can be accessed from your dashboard under booking history. If you cannot find an invoice, contact support for help.",
              },
              {
                q: "9. What happens if my payment fails?",
                a: "If a payment attempt fails, your booking may remain pending until payment is successfully completed. You can try again or use an alternative payment method.",
              },
              {
                q: "10. Can I book for a group?",
                a: "Yes. You can book for multiple travelers. For large groups or custom arrangements, please contact support so we can help coordinate details.",
              },
            ].map((item) => (
              <motion.section
                key={item.q}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0}
                variants={fadeUp}
                className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border"
              >
                <h2 className="font-display font-semibold text-card-foreground mb-2">{item.q}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </motion.section>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
