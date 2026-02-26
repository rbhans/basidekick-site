"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { List, X, Moon, Sun, User, SignOut, Gear, ShieldCheck, MagnifyingGlass } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
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
import { HeaderSearch } from "./header-search";
import { ROUTES } from "@/lib/routes";

const NAV_LINKS = [
  { href: ROUTES.TOOLS, label: "Tools" },
  { href: ROUTES.POINTSTACK, label: "PointStack" },
  { href: ROUTES.RESOURCES, label: "Resources" },
  { href: ROUTES.WIKI, label: "Wiki" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-[64px] px-4 sm:px-6 lg:px-10 border-b border-border/50 bg-background/90 backdrop-blur-md flex items-center">
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="font-heading text-[18px] font-bold text-foreground hover:text-primary transition-colors">
            [BASidekick]
          </Link>
        </div>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center justify-center gap-1 flex-1 mx-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                isActive(link.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
          <div className="hidden sm:block">
            <HeaderSearch />
          </div>

          {user && <NotificationBell />}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="w-4 h-4 hidden dark:block" />
            <Moon className="w-4 h-4 dark:hidden" />
          </Button>

          {/* User menu */}
          {!authLoading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative" aria-label="User menu">
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {getUserInitials()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(ROUTES.ACCOUNT)}>
                    <Gear className="w-4 h-4 mr-2" />
                    Account
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => router.push(ROUTES.ADMIN)}>
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
              <Button
                size="sm"
                onClick={() => router.push(ROUTES.SIGNIN)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm px-4"
              >
                Sign In
              </Button>
            )
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-background border-l border-border flex flex-col">
            <div className="h-[64px] px-4 flex items-center justify-between border-b border-border">
              <span className="font-heading text-lg font-bold">Menu</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-[15px] font-semibold transition-colors ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-border">
              <div className="sm:hidden mb-3">
                <HeaderSearch />
              </div>
              {!authLoading && !user && (
                <Button
                  className="w-full"
                  onClick={() => { router.push(ROUTES.SIGNIN); setMobileOpen(false); }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
