-- ============================================================
-- M1 (partial, safe): harden pointstack_notifications INSERT.
-- ============================================================
-- Notifications are created client-side (including cross-user: likes, replies,
-- follows, join-request approvals) and the UI renders the stored title/body and
-- uses `link` as an href. The previous policy only constrained actor_id, so an
-- attacker could send any user a notification with an arbitrary OFF-SITE link
-- (phishing). This restricts `link` to internal absolute paths and keeps the
-- actor bound to the authenticated caller.
--
-- All legitimate links are internal ("/pointstack/...", "/wiki/...") so this is
-- non-breaking. The regex also rejects protocol-relative ("//evil.com") and
-- backslash tricks. Cross-user notifications still always display the real actor
-- avatar, so residual same-user "spam" is low severity; fully eliminating it
-- would require server-side, event-verified notification generation.
-- ============================================================

DROP POLICY IF EXISTS "Users can create notifications for others" ON public.pointstack_notifications;
CREATE POLICY "Users can create notifications for others"
  ON public.pointstack_notifications FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'role' = 'service_role')
    OR (
      auth.uid() IS NOT NULL
      AND actor_id = auth.uid()
      AND (link IS NULL OR link ~ '^/[A-Za-z0-9]')
    )
  );
