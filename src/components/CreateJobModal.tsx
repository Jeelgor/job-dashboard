import { useState } from "react";
import { createJob } from "../lib/api";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
}

const TEMPLATES: Record<string, { type: string; payload: Record<string, unknown> }> = {
  email: {
    type: "email",
    payload: {
      to: "interviewer@company.com",
      subject: "Distributed Job Queue Demo",
      body: "This job was created from the React frontend and processed on AWS EC2 with BullMQ!",
    },
  },
  image: {
    type: "image-resize",
    payload: {
      imageUrl: "https://example.com/assets/sample.jpg",
      targetWidth: 1080,
      targetHeight: 720,
      format: "webp",
    },
  },
  report: {
    type: "report-export",
    payload: {
      reportId: "rep_weekly_analytics_2026",
      format: "PDF",
      includeCharts: true,
    },
  },
};

export default function CreateJobModal({ isOpen, onClose, onJobCreated }: CreateJobModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("email");
  const [type, setType] = useState<string>(TEMPLATES["email"].type);
  const [payloadStr, setPayloadStr] = useState<string>(
    JSON.stringify(TEMPLATES["email"].payload, null, 2)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTemplateChange = (key: string) => {
    setSelectedTemplate(key);
    if (key in TEMPLATES) {
      setType(TEMPLATES[key].type);
      setPayloadStr(JSON.stringify(TEMPLATES[key].payload, null, 2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let parsedPayload: Record<string, unknown> = {};
    try {
      parsedPayload = JSON.parse(payloadStr);
    } catch {
      setError("Payload must be valid JSON format");
      return;
    }

    setLoading(true);
    try {
      await createJob(type, parsedPayload);
      onJobCreated();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create job");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create New Background Job</h2>
            <p className="text-xs text-gray-500">Dispatches directly to BullMQ queue on AWS EC2</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Template presets */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Quick Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "email", label: "✉️ Email" },
                { id: "image", label: "🖼️ Image Resize" },
                { id: "report", label: "📄 PDF Export" },
              ].map(({ id, label }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => handleTemplateChange(id)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    selectedTemplate === id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Type Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Job Type
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. email, report-export"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* JSON Payload Editor */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Job Payload (JSON)
            </label>
            <textarea
              rows={5}
              value={payloadStr}
              onChange={(e) => setPayloadStr(e.target.value)}
              required
              className="w-full font-mono text-xs rounded-lg border border-gray-300 p-3 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Dispatching...
                </>
              ) : (
                "🚀 Dispatch Job"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
