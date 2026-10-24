import { useState } from "react";
import StatsCards from "../components/StatsCards";
import FilterBar from "../components/FilterBar";
import JobTable from "../components/JobTable";
import CreateJobModal from "../components/CreateJobModal";
import { createBulkJobs, type Job } from "../lib/api";

type StatusFilter = Job["status"] | "all";

export default function Page() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loadTestingCount, setLoadTestingCount] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDispatchLoad = async (count: number) => {
    setLoadTestingCount(count);
    setStatusMessage(`🚀 Enqueuing ${count} jobs to AWS BullMQ queue...`);
    try {
      await createBulkJobs(count, "distributed-task");
      setStatusMessage(`🔥 Dispatched ${count} jobs! Watch workers process concurrently below.`);
      triggerRefresh();
      setTimeout(() => setStatusMessage(null), 8000);
    } catch (err) {
      console.error("Bulk dispatch error:", err);
      setStatusMessage("❌ Failed to dispatch jobs. Check backend connection.");
    } finally {
      setLoadTestingCount(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 font-sans">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header with Title & Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Job Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              AWS EC2 BullMQ Queue & PostgreSQL Engine · Real-time concurrency
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Stress Test:
            </span>
            <button
              onClick={() => handleDispatchLoad(10)}
              disabled={loadTestingCount !== null}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-100 disabled:opacity-50 transition cursor-pointer"
            >
              {loadTestingCount === 10 ? "Dispatching..." : "⚡ 10 Jobs"}
            </button>

            <button
              onClick={() => handleDispatchLoad(50)}
              disabled={loadTestingCount !== null}
              className="inline-flex items-center rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 shadow-xs hover:bg-orange-100 disabled:opacity-50 transition cursor-pointer"
            >
              {loadTestingCount === 50 ? "Dispatching..." : "🔥 50 Jobs"}
            </button>

            <button
              onClick={() => handleDispatchLoad(100)}
              disabled={loadTestingCount !== null}
              className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-xs hover:bg-red-100 disabled:opacity-50 transition cursor-pointer"
            >
              {loadTestingCount === 100 ? "Dispatching..." : "💥 100 Jobs"}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
            >
              ➕ Custom Job
            </button>
          </div>
        </div>

        {/* Live Status Message Banner */}
        {statusMessage && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <span>{statusMessage}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-blue-500 hover:text-blue-800 text-xs ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards refreshTrigger={refreshTrigger} />

        {/* Filter + Table */}
        <div className="space-y-4">
          <FilterBar value={filter} onChange={setFilter} />
          <JobTable filter={filter} refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Modal */}
      <CreateJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onJobCreated={triggerRefresh}
      />
    </main>
  );
}
