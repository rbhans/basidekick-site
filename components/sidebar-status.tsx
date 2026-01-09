"use client";

import { useEffect, useState } from "react";
import { Circle, Cpu, HardDrive, Clock } from "@phosphor-icons/react";

interface StatusLED {
  label: string;
  status: "online" | "warning" | "offline" | "pulse";
}

const statusLEDs: StatusLED[] = [
  { label: "SYS", status: "online" },
  { label: "NET", status: "online" },
  { label: "API", status: "pulse" },
  { label: "DB", status: "online" },
];

export function SidebarStatus() {
  const [mounted, setMounted] = useState(false);
  const [cpu, setCpu] = useState(23);
  const [memory, setMemory] = useState(47);
  const [uptime, setUptime] = useState(0);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate fluctuating system stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => Math.max(15, Math.min(45, prev + (Math.random() - 0.5) * 8)));
      setMemory(prev => Math.max(35, Math.min(65, prev + (Math.random() - 0.5) * 4)));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: StatusLED["status"]) => {
    switch (status) {
      case "online":
        return "text-emerald-500";
      case "warning":
        return "text-amber-500";
      case "offline":
        return "text-red-500";
      case "pulse":
        return "text-emerald-500 animate-pulse";
    }
  };

  return (
    <div className="px-3 py-3 border-t border-border">
      {/* Section header */}
      <div className="text-[10px] font-mono text-cyan-500 dark:text-cyan-400 uppercase tracking-wider mb-2">
        System Status
      </div>

      {/* Status LEDs */}
      <div className="flex items-center gap-3 mb-3">
        {statusLEDs.map((led) => (
          <div key={led.label} className="flex items-center gap-1">
            <Circle
              className={`w-2 h-2 ${getStatusColor(led.status)}`}
              weight="fill"
            />
            <span className="text-[10px] font-mono text-muted-foreground">
              {led.label}
            </span>
          </div>
        ))}
      </div>

      {/* CPU Bar */}
      <div className="flex items-center gap-2 mb-1.5">
        <Cpu className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
        <div className="flex-1 h-1.5 bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: mounted ? `${cpu}%` : "23%" }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
          {mounted ? Math.round(cpu) : 23}%
        </span>
      </div>

      {/* Memory Bar */}
      <div className="flex items-center gap-2 mb-2">
        <HardDrive className="w-3 h-3 text-violet-500 dark:text-violet-400" />
        <div className="flex-1 h-1.5 bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
            style={{ width: mounted ? `${memory}%` : "47%" }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
          {mounted ? Math.round(memory) : 47}%
        </span>
      </div>

      {/* Uptime */}
      <div className="flex items-center gap-2">
        <Clock className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
        <span className="text-[10px] font-mono text-muted-foreground">
          Uptime: <span className="text-emerald-500 dark:text-emerald-400">{mounted ? formatUptime(uptime) : "00:00:00"}</span>
        </span>
      </div>
    </div>
  );
}
