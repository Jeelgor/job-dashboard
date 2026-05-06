import type { Job } from "../lib/api";

type StatusFilter = Job["status"] | "all";

interface FilterBarProps {
  value: StatusFilter;
  onChange: (status: StatusFilter) => void;
}

const options: { value: StatusFilter; label: string }[] = [
  { value: "all",        label: "All" },
  { value: "pending",    label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed",  label: "Completed" },
  { value: "failed",     label: "Failed" },
];

export default function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors
            ${value === opt.value
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
