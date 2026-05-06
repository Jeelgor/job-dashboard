// Empty string = relative URLs, proxied by Vite dev server to http://localhost:3000
// In production set VITE_API_URL to your backend origin
const BASE_URL = import.meta.env.VITE_API_URL || "";

export interface Job {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  payload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface JobStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface ListJobsParams {
  status?: Job["status"];
  type?: string;
  limit?: number;
  offset?: number;
}

export async function fetchJobs(params: ListJobsParams = {}): Promise<Job[]> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.type) query.set("type", params.type);
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));

  const url = `${BASE_URL}/api/jobs${query.toString() ? `?${query}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

export async function fetchJobById(id: string): Promise<Job> {
  const res = await fetch(`${BASE_URL}/api/jobs/${id}`);
  if (res.status === 404) throw new Error("Job not found");
  if (!res.ok) throw new Error("Failed to fetch job");
  return res.json();
}

export async function fetchJobStats(): Promise<JobStats> {
  const res = await fetch(`${BASE_URL}/api/jobs/stats`);
  if (!res.ok) throw new Error("Failed to fetch job stats");
  return res.json();
}

export async function createJob(type: string, payload: Record<string, unknown>): Promise<Job> {
  const res = await fetch(`${BASE_URL}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, payload }),
  });
  if (!res.ok) throw new Error("Failed to create job");
  return res.json();
}

export async function retryJob(id: string): Promise<Job> {
  const res = await fetch(`${BASE_URL}/api/jobs/${id}/retry`, { method: "POST" });
  if (res.status === 404) throw new Error("Job not found");
  if (res.status === 400) throw new Error("Job is not in failed status");
  if (!res.ok) throw new Error("Failed to retry job");
  return res.json();
}

export async function updateJob(id: string, status: Job["status"]): Promise<Job> {
  const res = await fetch(`${BASE_URL}/api/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update job");
  return res.json();
}

export async function deleteJob(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/jobs/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete job");
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}
