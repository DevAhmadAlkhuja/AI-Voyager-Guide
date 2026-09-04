import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type MessageRow = {
  id: number;
  user_id: number | null;
  name: string | null;
  email: string | null;
  topic: string;
  message: string;
  created_at: string;
  user_name?: string | null;
  user_email?: string | null;
};

type TopicStat = { topic: string; cnt: number };

const AdminContactInbox = () => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [topicStats, setTopicStats] = useState<TopicStat[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/contact/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json?.message || "Failed to load messages");
          return;
        }
        setMessages(json.messages || []);
        setTopicStats(json.topicStats || []);
      } catch {
        setError("Failed to reach backend");
      }
    };

    if (token && user?.role === "admin") run();
  }, [token, user?.role]);

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Contact Inbox</h1>
              <p className="text-muted-foreground mt-2">All contact messages from users and guests.</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to="/admin">Back to dashboard</Link>
            </Button>
          </div>

          {error && <p className="text-sm text-destructive mt-6">{error}</p>}

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border lg:col-span-2">
              <h2 className="font-display font-semibold text-card-foreground">Messages</h2>
              <div className="mt-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{m.topic}</p>
                      <p className="text-xs text-muted-foreground">{m.created_at}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{m.user_email || m.email || m.user_name || m.name || "Guest"}</p>
                    <p className="text-sm text-muted-foreground mt-2">{m.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] border border-border">
              <h2 className="font-display font-semibold text-card-foreground">Top topics</h2>
              <div className="mt-4 space-y-3">
                {topicStats.map((t) => (
                  <div key={t.topic} className="flex items-center justify-between">
                    <p className="text-sm text-foreground">{t.topic}</p>
                    <p className="text-sm text-muted-foreground">{t.cnt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContactInbox;
