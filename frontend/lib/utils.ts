import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return dateString;
  }
}

export function getGradeBadge(grade: string) {
  switch (grade) {
    case "S":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
    case "A+":
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300";
    case "A":
      return "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300";
    case "B+":
      return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300";
    case "B":
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300";
    case "C":
      return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300";
    case "F":
      return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300";
  }
}

export function getAttendanceBadge(pct: number) {
  if (pct >= 85) {
    return {
      label: "Excellent",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
    };
  } else if (pct >= 75) {
    return {
      label: "Regular",
      className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400"
    };
  } else if (pct >= 65) {
    return {
      label: "Condonation",
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
    };
  } else {
    return {
      label: "Critical",
      className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
    };
  }
}
