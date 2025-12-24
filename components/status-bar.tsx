"use client";

import { useState, useEffect } from "react";
import { Circle } from "@phosphor-icons/react";

// BAS-related status messages
const basMessages = [
  "AHU-01: Supply fan VFD @ 72% · DAT 55°F",
  "VAV-203: Zone temp 72.4°F · Damper 45%",
  "CHW Loop: ΔT 12.3°F · Flow 450 GPM",
  "Boiler-1: Firing rate 65% · Stack 340°F",
  "OAT: 45°F · RH 62% · Enthalpy 18.2 BTU/lb",
  "BACnet/IP: 847 points online · 0 alarms",
  "Chiller-01: Load 78% · ECWT 44°F · LCWT 54°F",
  "Economizer: 100% OA · Damper full open",
  "VFD-P1: Speed 1,450 RPM · Amps 12.4A",
  "Zone 3-West: CO2 680 ppm · Occupied",
  "HW Loop: Supply 140°F · Return 125°F",
  "RTU-05: Compressor 1 running · DX cooling",
];

interface StatusBarProps {
  status?: "ready" | "loading" | "error";
}

export function StatusBar({ status = "ready" }: StatusBarProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % basMessages.length);
        setIsVisible(true);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-7 px-4 border-t border-border bg-card/50 flex items-center justify-between text-xs font-mono text-muted-foreground">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Circle
            className={
              status === "ready"
                ? "w-2 h-2 text-primary"
                : status === "loading"
                ? "w-2 h-2 text-amber-500"
                : "w-2 h-2 text-red-500"
            }
            weight="fill"
          />
          {status === "ready" ? "Ready" : status === "loading" ? "Loading..." : "Error"}
        </span>
      </div>

      {/* Rotating BAS messages */}
      <div className="flex-1 text-center hidden sm:block">
        <span
          className={`text-muted-foreground/70 transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {basMessages[messageIndex]}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="mailto:rob@basidekick.com"
          className="hover:text-foreground transition-colors"
        >
          rob@basidekick.com
        </a>
        <span className="text-muted-foreground/60">|</span>
        <span>&copy; {new Date().getFullYear()} basidekick</span>
      </div>
    </div>
  );
}
