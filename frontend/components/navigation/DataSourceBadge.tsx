"use client";

import React, { useEffect, useState } from "react";
import { Database, ShieldAlert, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { IntegrationStatus } from "@/lib/types";

export default function DataSourceBadge() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);

  useEffect(() => {
    api.getIntegrationStatus()
      .then(setStatus)
      .catch(() => {
        // Fallback default
        setStatus({
          active_provider: "Demo Data",
          data_source_badge: "Demo Data",
          official_api_configured: false,
          sync_status: "Local",
          system_message: "Operating with local structured demonstration dataset."
        });
      });
  }, []);

  const badge = status?.data_source_badge || "Demo Data";

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs transition-colors"
      title={status?.system_message || "Active Academic Data Source"}
    >
      {badge === "Official API" ? (
        <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official API</span>
        </span>
      ) : badge === "Authorized Import" ? (
        <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>Authorized Import</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
          <Database className="w-3.5 h-3.5 text-amber-600" />
          <span>Demo Data</span>
        </span>
      )}
    </div>
  );
}
