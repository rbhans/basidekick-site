/**
 * Map raw Supabase auth error messages to friendly, on-brand copy. Falls back to
 * a generic message so we never surface a raw provider string to the user.
 */
export function friendlyAuthError(message: string | undefined | null): string {
  const m = (message ?? "").toLowerCase();

  if (m.includes("invalid login credentials")) {
    return "That email or password doesn't match. Check them and try again.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirm your email first. Check your inbox for the link we sent.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts. Wait a minute, then try again.";
  }
  if (m.includes("password") && m.includes("should be")) {
    return "That password doesn't meet the requirements. Try a stronger one.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}
