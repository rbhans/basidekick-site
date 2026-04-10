"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { List, X, SignOut, Gear, ShieldCheck } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { ease } from "@/components/motion";
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

const NAV_LINKS: { href: string; label: string }[] = [
  { href: ROUTES.ATLAS, label: "Atlas" },
  { href: ROUTES.POINTSTACK, label: "PointStack" },
  { href: ROUTES.WIKI, label: "Wiki" },
  { href: ROUTES.NEWS, label: "News" },
  { href: ROUTES.OPEN_SOURCE, label: "Open Source" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
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
        .select("role")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.role === "admin");
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
      <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-16 py-5 border-b border-border bg-background flex items-center gap-8">
        {/* Brand — italic Fraunces */}
        <Link
          href="/"
          className="font-heading italic text-[22px] font-semibold tracking-tight text-foreground hover:text-accent transition-colors shrink-0"
        >
          BASidekick
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8 ml-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-[14px] font-medium transition-colors ${
                isActive(link.href)
                  ? "text-accent"
                  : "text-foreground hover:text-accent"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-accent"
                  transition={ease.spring}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right cluster: search, notifications, user menu */}
        <div className="flex items-center gap-3 shrink-0 md:ml-6 ml-auto">
          <div className="hidden sm:block">
            <HeaderSearch />
          </div>

          {user && <NotificationBell />}

          {!authLoading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 relative"
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-mono text-xs font-medium">
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm px-4 rounded-md"
              >
                Sign in
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
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-foreground/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-background border-l border-border flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={ease.spring}
            >
              <div className="px-4 py-5 flex items-center justify-between border-b border-border">
                <span className="font-heading italic text-[20px] font-semibold tracking-tight">BASidekick</span>
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
                    className={`block px-4 py-3 rounded-md text-[15px] font-medium transition-colors ${
                      isActive(link.href)
                        ? "text-accent"
                        : "text-foreground hover:text-accent hover:bg-secondary"
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
                    Sign in
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
