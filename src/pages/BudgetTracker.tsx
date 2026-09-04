import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Plus, Trash2, PieChart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
}

const categories = ["Food", "Transport", "Accommodation", "Activities", "Shopping", "Other"];
const categoryColors: Record<string, string> = {
  Food: "bg-coral/20 text-coral",
  Transport: "bg-primary/20 text-primary",
  Accommodation: "bg-ocean-mid/20 text-ocean-mid",
  Activities: "bg-teal-glow/20 text-teal-glow",
  Shopping: "bg-coral-light/20 text-coral-light",
  Other: "bg-muted text-muted-foreground",
};

const BudgetTracker = () => {
  const { t } = useLanguage();
  const [totalBudget, setTotalBudget] = useState(2000);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", name: "Hotel Stay", amount: 450, category: "Accommodation", date: "2026-03-01" },
    { id: "2", name: "Street Food Tour", amount: 35, category: "Food", date: "2026-03-01" },
    { id: "3", name: "Grab Rides", amount: 25, category: "Transport", date: "2026-03-01" },
    { id: "4", name: "Batu Caves Tour", amount: 60, category: "Activities", date: "2026-03-02" },
    { id: "5", name: "Souvenirs", amount: 80, category: "Shopping", date: "2026-03-02" },
  ]);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Food");

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercent = Math.min((totalSpent / totalBudget) * 100, 100);

  const categoryTotals = categories.map((cat) => ({
    name: cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  const addExpense = () => {
    if (!newName || !newAmount) return;
    setExpenses((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newName, amount: parseFloat(newAmount), category: newCategory, date: new Date().toISOString().split("T")[0] },
    ]);
    setNewName("");
    setNewAmount("");
  };

  const removeExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial="hidden" animate="visible" className="text-center mb-10">
            <motion.h1 custom={0} variants={fadeUp} className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              {t("budget.title")}
            </motion.h1>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground">
              {t("budget.subtitle")}
            </motion.p>
          </motion.div>

          {/* Budget Overview */}
          <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div custom={0} variants={fadeUp} className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] border border-border">
              <p className="text-xs text-muted-foreground uppercase mb-1">Total Budget</p>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="text-2xl font-display font-bold text-card-foreground bg-transparent border-none outline-none w-32"
                />
                <span className="text-sm text-muted-foreground">RM</span>
              </div>
            </motion.div>
            <motion.div custom={1} variants={fadeUp} className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] border border-border">
              <p className="text-xs text-muted-foreground uppercase mb-1">Spent</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-coral" />
                <span className="text-2xl font-display font-bold text-card-foreground">{totalSpent.toFixed(0)}</span>
                <span className="text-sm text-muted-foreground">RM</span>
              </div>
            </motion.div>
            <motion.div custom={2} variants={fadeUp} className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] border border-border">
              <p className="text-xs text-muted-foreground uppercase mb-1">Remaining</p>
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                <span className={`text-2xl font-display font-bold ${remaining >= 0 ? "text-primary" : "text-destructive"}`}>
                  {remaining.toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground">RM</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{spentPercent.toFixed(0)}% spent</span>
              <span>{(100 - spentPercent).toFixed(0)}% remaining</span>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${spentPercent > 90 ? "bg-destructive" : spentPercent > 70 ? "bg-coral" : "bg-primary"}`}
                style={{ width: `${spentPercent}%` }}
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Expense */}
            <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
              <div className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] border border-border space-y-3">
                <h3 className="font-display font-semibold text-card-foreground">Add Expense</h3>
                <input
                  type="text"
                  placeholder="Expense name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <input
                  type="number"
                  placeholder="Amount (RM)"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Button variant="hero" className="w-full" onClick={addExpense}>
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>

              {/* Category Breakdown */}
              <div className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] border border-border mt-4">
                <h3 className="font-display font-semibold text-card-foreground mb-3">By Category</h3>
                <div className="space-y-2">
                  {categoryTotals.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[cat.name] || "bg-muted text-muted-foreground"}`}>{cat.name}</span>
                      <span className="text-sm font-medium text-card-foreground">RM {cat.total.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Expenses List */}
            <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="lg:col-span-2">
              <div className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] border border-border">
                <h3 className="font-display font-semibold text-card-foreground mb-4">Expenses</h3>
                <div className="space-y-2">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[exp.category] || "bg-muted text-muted-foreground"}`}>
                          {exp.category}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{exp.name}</p>
                          <p className="text-xs text-muted-foreground">{exp.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-card-foreground">RM {exp.amount}</span>
                        <button onClick={() => removeExpense(exp.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">No expenses yet. Start adding!</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BudgetTracker;
