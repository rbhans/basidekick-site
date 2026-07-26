# Open Questions

- Full moderation screen parity should be reviewed with an authenticated admin account before cutover.
- Supabase Auth should be checked in the dashboard before domain cutover: `https://basidekick.com` should remain the Site URL, and both the Vercel preview callback and production callback should be in the redirect allow list.
- Leaked-password protection is a dashboard-level Auth setting and should be enabled before public account promotion.
- Cutover requires an accessibility, redirects, SEO, and live-domain propagation review after the private preview is approved.
