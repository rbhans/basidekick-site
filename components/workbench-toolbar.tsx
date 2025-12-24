"use client";

import { useEffect, useState } from "react";
import { Circle, List, Moon, Sun, Drop, Thermometer } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Logo } from "./logo";
import { Button } from "./ui/button";

interface WorkbenchToolbarProps {
  onMenuClick?: () => void;
  onHomeClick?: () => void;
  pageTitle?: string;
}

interface WeatherData {
  temp: number;
  humidity: number;
  loading: boolean;
}

export function WorkbenchToolbar({ onMenuClick, onHomeClick, pageTitle = "Home" }: WorkbenchToolbarProps) {
  const { theme, setTheme } = useTheme();
  const [weather, setWeather] = useState<WeatherData>({ temp: 72, humidity: 45, loading: true });

  useEffect(() => {
    // Try to get real weather data using geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&temperature_unit=fahrenheit`
            );
            const data = await response.json();
            setWeather({
              temp: Math.round(data.current.temperature_2m),
              humidity: Math.round(data.current.relative_humidity_2m),
              loading: false,
            });
          } catch {
            // Use defaults on error
            setWeather({ temp: 72, humidity: 45, loading: false });
          }
        },
        () => {
          // Use defaults if geolocation denied
          setWeather({ temp: 72, humidity: 45, loading: false });
        }
      );
    } else {
      setWeather({ temp: 72, humidity: 45, loading: false });
    }
  }, []);

  return (
    <header className="h-12 px-4 border-b border-border bg-card flex items-center justify-between">
      {/* Left side: Menu button (mobile) + Logo */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <List className="w-5 h-5" />
        </Button>

        <Logo onClick={onHomeClick} />

        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 ml-4 text-xs font-mono text-muted-foreground">
          <Circle className="w-2 h-2 text-emerald-500" weight="fill" />
          <span>Connected</span>
        </div>
      </div>

      {/* Center: Page title */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
        <h1 className="text-sm font-mono font-medium text-foreground">
          {pageTitle}
        </h1>
      </div>

      {/* Right side: Weather + Actions */}
      <div className="flex items-center gap-4">
        {/* Weather display */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-primary" />
            <span>{weather.loading ? "--" : `${weather.temp}°F`}</span>
          </div>
          <div className="flex items-center gap-1">
            <Drop className="w-3.5 h-3.5 text-primary" />
            <span>{weather.loading ? "--" : `${weather.humidity}%`}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="w-4 h-4 hidden dark:block" />
          <Moon className="w-4 h-4 dark:hidden" />
        </Button>
      </div>
    </header>
  );
}
