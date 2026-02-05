"use client";

import { useEffect, useState } from "react";
import { Circle, List, Moon, Sun, Drop, Thermometer, User, SignOut, Gear, UserPlus, ShieldCheck, Bell } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Logo } from "./logo";
import { HeaderSearch } from "./header-search";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/pointstack/notifications/notification-bell";
import { MessengerTrigger } from "@/components/pointstack/messenger";

interface WorkbenchToolbarProps {
  onMenuClick?: () => void;
  onHomeClick?: () => void;
  onNavigate?: (viewId: string) => void;
  pageTitle?: string;
}

interface WeatherData {
  temp: number;
  humidity: number;
  city: string;
  loading: boolean;
}

// US cities for rotating weather display
const US_LOCATIONS = [
  { name: "NYC", lat: 40.7128, lon: -74.006 },
  { name: "LA", lat: 34.0522, lon: -118.2437 },
  { name: "Chicago", lat: 41.8781, lon: -87.6298 },
  { name: "Houston", lat: 29.7604, lon: -95.3698 },
  { name: "Phoenix", lat: 33.4484, lon: -112.074 },
  { name: "Denver", lat: 39.7392, lon: -104.9903 },
  { name: "Seattle", lat: 47.6062, lon: -122.3321 },
  { name: "Miami", lat: 25.7617, lon: -80.1918 },
  { name: "Atlanta", lat: 33.749, lon: -84.388 },
  { name: "Dallas", lat: 32.7767, lon: -96.797 },
];

export function WorkbenchToolbar({ onMenuClick, onHomeClick, onNavigate, pageTitle = "Home" }: WorkbenchToolbarProps) {
  const { theme, setTheme } = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const [weather, setWeather] = useState<WeatherData>({ temp: 72, humidity: 45, city: "NYC", loading: true });
  const [locationIndex, setLocationIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch weather for current location
  useEffect(() => {
    const fetchWeather = async () => {
      const location = US_LOCATIONS[locationIndex];
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m&temperature_unit=fahrenheit`
        );
        const data = await response.json();
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m),
          city: location.name,
          loading: false,
        });
      } catch {
        setWeather({ temp: 72, humidity: 45, city: location.name, loading: false });
      }
    };

    fetchWeather();
  }, [locationIndex]);

  // Rotate through locations every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLocationIndex((prev) => (prev + 1) % US_LOCATIONS.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.is_admin || false);
    };
    checkAdmin();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="h-12 px-4 border-b border-border bg-card flex items-center justify-between">
      {/* Left side: Menu button (mobile) + Logo */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden group"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <List className="w-5 h-5 transition-all duration-150 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
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

      {/* Right side: Search + Weather + Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:block">
          <HeaderSearch />
        </div>

        {/* Weather display - rotating world cities */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span className="text-primary">{weather.city}</span>
          <div className="flex items-center gap-1 group cursor-default">
            <Thermometer className="w-3.5 h-3.5 text-primary transition-all duration-150 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
            <span>{weather.loading ? "--" : `${weather.temp}°F`}</span>
          </div>
          <div className="flex items-center gap-1 group cursor-default">
            <Drop className="w-3.5 h-3.5 text-primary transition-all duration-150 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
            <span>{weather.loading ? "--" : `${weather.humidity}%`}</span>
          </div>
        </div>

        {/* Messages and notifications for logged-in users */}
        {user && (
          <>
            <MessengerTrigger />
            <NotificationBell />
          </>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          className="group"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="w-4 h-4 hidden dark:block transition-all duration-150 group-hover:scale-110 group-hover:rotate-12 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0" />
          <Moon className="w-4 h-4 dark:hidden transition-all duration-150 group-hover:scale-110 group-hover:-rotate-12 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0" />
        </Button>

        {/* User menu */}
        {!authLoading && (
          user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="relative group"
                  aria-label="User menu"
                >
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium transition-all duration-150 group-hover:scale-110 group-hover:shadow-[0_0_8px_hsl(var(--primary)/0.5)] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:shadow-none">
                    {getUserInitials()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate?.("account")}>
                  <Gear className="w-4 h-4 mr-2" />
                  Account
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => onNavigate?.("admin")}>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <SignOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate?.("signin")}
                className="text-xs group"
              >
                <User className="w-4 h-4 sm:mr-1.5 transition-all duration-150 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onNavigate?.("signup")}
                className="text-xs group"
              >
                <UserPlus className="w-4 h-4 sm:mr-1.5 transition-all duration-150 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                <span className="hidden sm:inline">Sign Up</span>
              </Button>
            </div>
          )
        )}
      </div>
    </header>
  );
}
