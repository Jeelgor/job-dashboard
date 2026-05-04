import { useEffect, useState } from "react";
import { fetchJobStats, type JobStats } from "../lib/api";

const POLL_INTERVAL = 5000; // 5 seconds

const cards: {
  key: keyof JobStats;
  label: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
}[] = [
  { key: "pending",    label: "Pending",    bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", dot: "bg-yellow-400" },
  { key: "processing", label: "Processing", bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-800",   dot: "bg-blue-400"   },
  { key: "completed",  label: "Completed",  bg: "bg-green-50",  border: "border-green-200",  text: "text-green-800",  dot: "bg-green-400"  },
  { key: "failed",     label: "Failed",     bg: "bg-red-50",    border: "border-red-200",    text: "text-red-800",    dot: "bg-red-400"    },
];

export default function StatsCards() {
  const [stats, setStats] = useState<JobStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetchJobStats()
      .then((data) => {
        setStats(data);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        Could not load stats: {error}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map(({ key, label, bg, border, text, dot }) => (
        <div key={key} className={`rounded-xl border ${bg} ${border} p-5`}>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            <p className={`text-xs font-semibold uppercase tracking-wide ${text} opacity-70`}>
              {label}
            </p>
          </div>
          <p className={`mt-2 text-3xl font-bold ${text}`}>
            {stats ? stats[key].toLocaleString() : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
