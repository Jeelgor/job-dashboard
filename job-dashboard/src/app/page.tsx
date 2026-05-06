import { useState } from "react";
import StatsCards from "../components/StatsCards";
import FilterBar from "../components/FilterBar";
import JobTable from "../components/JobTable";
import type { Job } from "../lib/api";

type StatusFilter = Job["status"] | "all";

export default function Page() {
  const [filter, setFilter] = useState<StatusFilter>("all");

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage background jobs · stats refresh every 5s
          </p>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Filter + Table */}
        <div className="space-y-4">
          <FilterBar value={filter} onChange={setFilter} />
          <JobTable filter={filter} />
        </div>
      </div>
    </main>
  );
}
