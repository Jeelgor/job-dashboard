import { useEffect, useState, useCallback } from "react";
import { fetchJobs, retryJob, type Job, type ListJobsParams } from "../lib/api";

type StatusFilter = Job["status"] | "all";

interface JobTableProps {
  filter: StatusFilter;
}

const POLL_INTERVAL = 4000; // poll when processing jobs are visible

const statusBadge: Record<Job["status"], string> = {
  pending:    "bg-yellow-100 text-yellow-700 ring-yellow-200",
  processing: "bg-blue-100 text-blue-700 ring-blue-200",
  completed:  "bg-green-100 text-green-700 ring-green-200",
  failed:     "bg-red-100 text-red-700 ring-red-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JobTable({ filter }: JobTableProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const load = useCallback(() => {
    const params: ListJobsParams = { limit: 100, offset: 0 };
    if (filter !== "all") params.status = filter;

    fetchJobs(params)
      .then((data) => {
        setJobs(data);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Poll when showing processing or all jobs
  useEffect(() => {
    const shouldPoll = filter === "all" || filter === "processing";
    if (!shouldPoll) return;
    const id = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [filter, load]);

  const handleRetry = async (id: string) => {
    setRetrying(id);
    try {
      await retryJob(id);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setRetrying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading jobs…
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        Could not load jobs: {error}
      </p>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        No jobs found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            {["ID", "Type", "Status", "Attempts", "Created", ""].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-400">
                {job.id.slice(0, 8)}…
              </td>
              <td className="px-4 py-3 font-medium text-gray-800">{job.type}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadge[job.status]}`}
                >
                  {job.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{job.attempts}</td>
              <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(job.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                {job.status === "failed" && (
                  <button
                    onClick={() => handleRetry(job.id)}
                    disabled={retrying === job.id}
                    className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    {retrying === job.id ? "Retrying…" : "↺ Retry"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
