import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { AUTH_CHANGED_EVENT } from "@/components/UserAvatarMenu";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const apiBaseUrl = "http://localhost:5000";

  const handleSubmit = async () => {
    setError(null);

    if (!isLogin) {
      const n = String(name || "").trim();
      if (n.length < 2) {
        setError("Name is required");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email, password }
        : { name: String(name || "").trim(), email, password };

      const res = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Request failed");
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));

      if (data?.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch {
      setError("Failed to reach backend. Make sure it is running on localhost:5000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? "Log in to access your travel dashboard" : "Start your AI-powered travel journey"}
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)] border border-border">
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-card-foreground mb-1.5">
                    <User className="w-4 h-4 text-primary" /> Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>
              )}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-card-foreground mb-1.5">
                  <Mail className="w-4 h-4 text-primary" /> Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-card-foreground mb-1.5">
                  <Lock className="w-4 h-4 text-primary" /> Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                variant="hero"
                size="lg"
                className="w-full text-base py-6"
                onClick={handleSubmit}
                disabled={loading}
              >
                {isLogin ? "Log In" : "Create Account"} <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="font-semibold text-primary">{isLogin ? "Sign Up" : "Log In"}</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link to="/" className="hover:text-primary transition-colors">← Back to Home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
