"use client";

import type { RefObject } from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { ThemeProvider } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/primitives/dialog";
import { createClient } from "@/lib/supabase/client";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  requestSignIn: (action?: string, redirectTo?: string) => void;
  closeSignIn: () => void;
  signInOpen: boolean;
  requestedAction: string;
  requestedRedirect: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(client));
  const [signInOpen, setSignInOpen] = useState(false);
  const [requestedAction, setRequestedAction] = useState("continue");
  const [requestedRedirect, setRequestedRedirect] = useState<string | null>(null);
  const signInReturnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!client) return;
    client.auth.getSession().then((result) => {
      setSession(result.data.session);
      setLoading(false);
    });
    const { data } = client.auth.onAuthStateChange((_event: AuthChangeEvent, next: Session | null) => {
      setSession(next);
      setLoading(false);
      if (next) setSignInOpen(false);
    });
    return () => data.subscription.unsubscribe();
  }, [client]);

  const value: AuthState = {
    user: session?.user ?? null,
    session,
    loading,
    signInOpen,
    requestedAction,
    requestedRedirect,
    requestSignIn(action = "continue", redirectTo?: string) {
      signInReturnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setRequestedAction(action);
      setRequestedRedirect(redirectTo ?? window.location.pathname);
      setSignInOpen(true);
    },
    closeSignIn: () => setSignInOpen(false),
    signOut: async () => {
      await client?.auth.signOut();
    },
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthContext.Provider value={value}>
        {children}
        <SignInGate returnFocusRef={signInReturnFocusRef} />
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside Providers");
  return value;
}

function SignInGate({
  returnFocusRef,
}: {
  returnFocusRef: RefObject<HTMLElement | null>;
}) {
  const auth = useContext(AuthContext);
  if (!auth) return null;
  const signedIn = Boolean(auth.user);

  return (
    <Dialog
      open={auth.signInOpen}
      onOpenChange={(open) => {
        if (!open) auth.closeSignIn();
      }}
    >
      <DialogContent
        className="modal-panel"
        overlayClassName="modal-backdrop"
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <DialogTitle id="signin-gate-title">
          {signedIn
            ? "This action is returning soon."
            : `Sign in to ${auth.requestedAction}`}
        </DialogTitle>
        <DialogDescription>
          {signedIn
            ? `The workflow to ${auth.requestedAction} is still being connected. Nothing was submitted or changed.`
            : "Everything is readable without an account. Sign in only when you want to contribute, save, or message."}
        </DialogDescription>
        <div className="modal-actions">
          {!signedIn && (
            <a
              className="button primary"
              href={`/signin?redirect=${encodeURIComponent(
                auth.requestedRedirect ?? "/",
              )}`}
            >
              Sign in
            </a>
          )}
          <button
            className="button quiet"
            type="button"
            onClick={auth.closeSignIn}
          >
            Keep browsing
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
