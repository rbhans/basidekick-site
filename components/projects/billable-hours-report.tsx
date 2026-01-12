"use client";

import { useState, useMemo } from "react";
import { Clock, Calendar, CurrencyDollar, Export } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects, useClients, useTimeEntries } from "./project-hooks";
import { cn } from "@/lib/utils";

interface BillableHoursReportProps {
  className?: string;
}

export function BillableHoursReport({ className }: BillableHoursReportProps) {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { timeEntries } = useTimeEntries();

  // Date range filter - default to current month
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(
    firstOfMonth.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [groupBy, setGroupBy] = useState<"client" | "project">("client");

  // Filter time entries by date range
  const filteredEntries = useMemo(() => {
    return timeEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // Include full end date
      return entryDate >= start && entryDate <= end;
    });
  }, [timeEntries, startDate, endDate]);

  // Group data by client or project
  const groupedData = useMemo(() => {
    const groups: Record<
      string,
      {
        id: string;
        name: string;
        clientName?: string;
        entries: typeof filteredEntries;
        totalMinutes: number;
        hourlyRate: number;
        billableAmount: number;
      }
    > = {};

    filteredEntries.forEach((entry) => {
      const project = projects.find((p) => p.id === entry.project_id);
      if (!project) return;

      const client = project.client_id
        ? clients.find((c) => c.id === project.client_id)
        : null;

      const groupKey =
        groupBy === "client"
          ? client?.id || "no-client"
          : project.id;

      const groupName =
        groupBy === "client"
          ? client?.name || (project.is_internal ? "Internal Projects" : "No Client")
          : project.name;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          name: groupName,
          clientName: groupBy === "project" ? client?.name : undefined,
          entries: [],
          totalMinutes: 0,
          hourlyRate: project.hourly_rate || 0,
          billableAmount: 0,
        };
      }

      groups[groupKey].entries.push(entry);
      groups[groupKey].totalMinutes += entry.duration;

      // For client grouping, use the project's hourly rate for this entry
      const rate = project.hourly_rate || 0;
      groups[groupKey].billableAmount += (entry.duration / 60) * rate;
    });

    // Calculate billable amounts for project grouping
    Object.values(groups).forEach((group) => {
      if (groupBy === "project") {
        group.billableAmount = (group.totalMinutes / 60) * group.hourlyRate;
      }
    });

    return Object.values(groups).sort((a, b) =>
      b.totalMinutes - a.totalMinutes
    );
  }, [filteredEntries, projects, clients, groupBy]);

  // Totals
  const totals = useMemo(() => {
    return groupedData.reduce(
      (acc, group) => ({
        minutes: acc.minutes + group.totalMinutes,
        billable: acc.billable + group.billableAmount,
      }),
      { minutes: 0, billable: 0 }
    );
  }, [groupedData]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatHours = (minutes: number) => {
    return (minutes / 60).toFixed(1);
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Hours", "Rate", "Billable Amount"];
    const rows = groupedData.map((group) => [
      group.name,
      formatHours(group.totalMinutes),
      group.hourlyRate.toFixed(2),
      group.billableAmount.toFixed(2),
    ]);
    rows.push([
      "TOTAL",
      formatHours(totals.minutes),
      "",
      totals.billable.toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billable-hours-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("border border-border bg-card", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Billable Hours Report</h2>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Export className="mr-1 size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36 h-8"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-36 h-8"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={groupBy === "client" ? "default" : "outline"}
              size="sm"
              onClick={() => setGroupBy("client")}
            >
              By Client
            </Button>
            <Button
              variant={groupBy === "project" ? "default" : "outline"}
              size="sm"
              onClick={() => setGroupBy("project")}
            >
              By Project
            </Button>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                {groupBy === "client" ? "Client" : "Project"}
              </th>
              {groupBy === "project" && (
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                  Client
                </th>
              )}
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                Hours
              </th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                Rate
              </th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                Billable
              </th>
            </tr>
          </thead>
          <tbody>
            {groupedData.length === 0 ? (
              <tr>
                <td
                  colSpan={groupBy === "project" ? 5 : 4}
                  className="p-8 text-center text-muted-foreground"
                >
                  No time entries found for this date range.
                </td>
              </tr>
            ) : (
              <>
                {groupedData.map((group) => (
                  <tr
                    key={group.id}
                    className="border-b border-border hover:bg-muted/30"
                  >
                    <td className="p-3 text-sm">{group.name}</td>
                    {groupBy === "project" && (
                      <td className="p-3 text-sm text-muted-foreground">
                        {group.clientName || "—"}
                      </td>
                    )}
                    <td className="p-3 text-sm text-right font-mono">
                      {formatHours(group.totalMinutes)}
                    </td>
                    <td className="p-3 text-sm text-right font-mono text-muted-foreground">
                      {groupBy === "project" && group.hourlyRate > 0
                        ? `$${group.hourlyRate}`
                        : "—"}
                    </td>
                    <td className="p-3 text-sm text-right font-mono font-medium">
                      {group.billableAmount > 0
                        ? `$${group.billableAmount.toFixed(2)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-muted/50 font-medium">
                  <td className="p-3 text-sm">Total</td>
                  {groupBy === "project" && <td className="p-3"></td>}
                  <td className="p-3 text-sm text-right font-mono">
                    {formatHours(totals.minutes)}
                  </td>
                  <td className="p-3"></td>
                  <td className="p-3 text-sm text-right font-mono">
                    ${totals.billable.toFixed(2)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-2xl font-semibold">{formatDuration(totals.minutes)}</p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{groupedData.length}</p>
            <p className="text-xs text-muted-foreground">
              {groupBy === "client" ? "Clients" : "Projects"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-primary">
              ${totals.billable.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Total Billable</p>
          </div>
        </div>
      </div>
    </div>
  );
}
