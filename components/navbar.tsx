"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { List, X, SignOut, Gear, ShieldCheck, MagnifyingGlass } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { ease } from "@/components/motion";
import { BrandMark } from "./brand-mark";
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
import { MegaMenu } from "./nav/mega-menu";
import { NAV_GROUPS } from "./nav/nav-config";

const PRIMARY_LINK = { href: ROUTES.ATLAS, label: "Atlas" };

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
      <header
        className="sticky top-0 z-40 border-b border-[var(--sand-line)]"
        style={{ background: "rgba(250,250,248,.85)", backdropFilter: "blur(6px)" }}
      >
        <div className="bsk-wrap grid grid-cols-[auto_1fr_auto] items-center gap-7 h-[68px] max-md:gap-3 max-md:h-[60px]">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-90 transition-opacity">
            <BrandMark />
            <span className="font-sans font-extrabold text-[18px] tracking-[-0.005em] text-ink">
              BASidekick
            </span>
            <span className="hidden lg:inline ml-3.5 pl-3.5 border-l border-[var(--sand-line-2)] font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">
              Independent BAS Toolkit
            </span>
          </Link>

          {/* Center — search button */}
          <div className="hidden md:flex justify-center items-center min-w-0">
            <div className="w-full max-w-[380px]">
              <HeaderSearch />
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2 shrink-0">
            <nav className="hidden lg:flex items-center gap-[2px]">
              {(() => {
                const active = isActive(PRIMARY_LINK.href);
                return (
                  <Link
                    href={PRIMARY_LINK.href}
                    className={`relative px-3 py-2 rounded-sm font-sans text-[13.5px] font-medium transition-colors ${
                      active
                        ? "text-ink"
                        : "text-ink-2 hover:text-ink hover:bg-[var(--sand-2)]"
                    }`}
                  >
                    {PRIMARY_LINK.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute left-3 right-3 -bottom-px h-[2px] bg-punch rounded-[2px]"
                        transition={ease.spring}
                      />
                    )}
                  </Link>
                );
              })()}
              {NAV_GROUPS.map((group) => (
                <MegaMenu key={group.id} group={group} />
              ))}
            </nav>

            {/* Mobile-only inline search */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Search"
                onClick={() => setMobileOpen(true)}
              >
                <MagnifyingGlass className="w-4 h-4" />
              </Button>
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
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-sans font-semibold text-[13px]">
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
                  className="bg-primary text-primary-foreground hover:bg-[#000] font-semibold text-[12.5px] h-[30px] px-3 rounded-sm"
                >
                  Sign in
                </Button>
              )
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
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
                <div className="flex items-center gap-2.5">
                  <BrandMark />
                  <span className="font-sans font-extrabold text-[16px] tracking-[-0.005em] text-ink">
                    BASidekick
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex-1 p-4 overflow-y-auto">
                <Link
                  href={PRIMARY_LINK.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-md text-[15px] font-medium transition-colors ${
                    isActive(PRIMARY_LINK.href)
                      ? "text-foreground bg-secondary"
                      : "text-foreground hover:text-punch hover:bg-secondary"
                  }`}
                >
                  {PRIMARY_LINK.label}
                </Link>
                {NAV_GROUPS.map((group) => (
                  <div key={group.id} className="mt-5">
                    <div className="px-4 pb-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">
                      {group.label}
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block px-4 py-2.5 rounded-md text-[14.5px] transition-colors ${
                            isActive(item.href)
                              ? "text-foreground bg-secondary font-medium"
                              : "text-foreground hover:text-punch hover:bg-secondary"
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
              <div className="p-4 border-t border-border">
                <div className="mb-3">
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
