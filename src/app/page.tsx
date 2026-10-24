import { useState } from "react";
import StatsCards from "../components/StatsCards";
import FilterBar from "../components/FilterBar";
import JobTable from "../components/JobTable";
import CreateJobModal from "../components/CreateJobModal";
import { createJob, type Job } from "../lib/api";

type StatusFilter = Job["status"] | "all";

export default function Page() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDispatchBatch = async () => {
    setBatchLoading(true);
    try {
      const demoJobs = [
        { type: "email-welcome", payload: { user: "alice@demo.com", plan: "Pro" } },
        { type: "image-resize", payload: { width: 1920, height: 1080, format: "png" } },
        { type: "pdf-invoice", payload: { invoiceId: "INV-2026-001", amount: 250.0 } },
        { type: "report-analytics", payload: { period: "Q3-2026", metrics: ["clicks", "conversions"] } },
        { type: "notification-push", payload: { channel: "slack", message: "Deployment Success" } },
      ];

      await Promise.all(demoJobs.map((j) => createJob(j.type, j.payload)));
      triggerRefresh();
    } catch (err) {
      console.error("Batch dispatch error:", err);
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header with Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Job Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              AWS EC2 BullMQ Queue & PostgreSQL persistence · stats auto-refresh
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDispatchBatch}
              disabled={batchLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 transition cursor-pointer"
            >
              {batchLoading ? (
                <>
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
                  Dispatching 5 Jobs...
                </>
              ) : (
                "⚡ Dispatch 5 Demo Jobs"
              )}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
            >
              ➕ Create Job
            </button>
          </div>
        </div>

        {/* Stats */}
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
