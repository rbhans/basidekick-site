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
  const [cpu, setCpu] = useState(23);
  const [memory, setMemory] = useState(47);
  const [uptime, setUptime] = useState(0);

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
      <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">
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
        <Cpu className="w-3 h-3 text-muted-foreground" />
        <div className="flex-1 h-1.5 bg-muted overflow-hidden">
          <div
            className="h-full bg-primary/70 transition-all duration-500"
            style={{ width: `${cpu}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
          {Math.round(cpu)}%
        </span>
      </div>

      {/* Memory Bar */}
      <div className="flex items-center gap-2 mb-2">
        <HardDrive className="w-3 h-3 text-muted-foreground" />
        <div className="flex-1 h-1.5 bg-muted overflow-hidden">
          <div
            className="h-full bg-primary/70 transition-all duration-500"
            style={{ width: `${memory}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
          {Math.round(memory)}%
        </span>
      </div>

      {/* Uptime */}
      <div className="flex items-center gap-2">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] font-mono text-muted-foreground">
          Uptime: {formatUptime(uptime)}
        </span>
      </div>
    </div>
  );
}
