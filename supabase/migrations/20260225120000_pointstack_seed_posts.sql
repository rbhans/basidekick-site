-- ============================================================
-- SEED: PointStack feeder posts
-- ============================================================
-- Inserts three community-seeding posts authored by rob@basidekick.com
-- about upcoming features and resources.
-- Runs with service_role privileges (bypasses RLS).
-- ============================================================

-- rob@basidekick.com user ID: 74c2b81d-db84-46c0-bdf9-6e09bb12d3df

-- ============================================================
-- POST 1: QRSidekick coming soon
-- ============================================================
INSERT INTO public.pointstack_posts (
  author_id, post_type, title, content, slug, tags, is_published, is_pinned, metadata
)
VALUES (
  '74c2b81d-db84-46c0-bdf9-6e09bb12d3df',
  'discussion',
  'QRSidekick is Coming Soon — Scan, Track, and Control Building Equipment from Your Phone',
  E'We''re building something we think field technicians are going to love.\n\n**QRSidekick** is a mobile app (iOS and Android) that lets you scan a QR code on any piece of building equipment and instantly see its live data, history, and maintenance notes — right from your phone.\n\n## How it works\n\n1. **Scan a QR code** on a rooftop unit, VAV box, chiller, or any tagged equipment\n2. **View live data** — discharge temps, fan status, valve positions, setpoints — pulled straight from Niagara\n3. **Add maintenance notes** — document repairs, inspections, and observations with timestamps so your whole team stays informed\n\n## Who it''s for\n\nQRSidekick is designed for HVAC technicians, controls contractors, facility maintenance teams, and property managers who want faster access to equipment data without opening a laptop or navigating through a BAS frontend.\n\n## Pricing\n\nWe''re keeping it simple:\n\n- **Free to scan** — scan any QR code, no charge\n- **$8 per station** — unlock full station management\n\n## What we''d love to hear from you\n\nWhat equipment do you find yourself checking most often in the field? What info would be most useful at a glance? Drop your thoughts below — your feedback will directly shape what we build.\n\nStay tuned for the beta release.',
  'qrsidekick-coming-soon',
  ARRAY['qrsidekick', 'mobile', 'qr-codes', 'field-tools', 'niagara'],
  true,
  true,
  '{"announcement": true}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- POST 2: BAS Atlas
-- ============================================================
INSERT INTO public.pointstack_posts (
  author_id, post_type, title, content, slug, tags, is_published, is_pinned, metadata
)
VALUES (
  '74c2b81d-db84-46c0-bdf9-6e09bb12d3df',
  'tip',
  'BAS Atlas — A Unified Reference for Point Naming Standards and Equipment Catalogs',
  E'If you''ve ever wasted time searching for the right point abbreviation or arguing about naming conventions on a project, **BAS Atlas** is here to help.\n\n## What is BAS Atlas?\n\nBAS Atlas is a free, open reference that combines two things every BAS professional needs:\n\n1. **Point naming standards** — Searchable database of standardized point names, abbreviations, and descriptions used across the industry. Whether you call it DAT or Discharge Air Temp, Atlas has it mapped.\n2. **Equipment catalog** — Browse controllers, sensors, actuators, and other BAS equipment organized by brand, type, and model. See specs, documentation links, and community notes all in one place.\n\n## Why we built it\n\nEvery integrator has their own naming conventions. Every manufacturer has their own terminology. This makes onboarding new techs harder and cross-vendor projects messier than they need to be.\n\nAtlas gives the industry a shared reference point — not to enforce a single standard, but to provide a Rosetta Stone so everyone can speak the same language when it matters.\n\n## How to use it\n\n- **Search points** — Type any abbreviation (like SAT, DAT, CHWVP) and get the full name, description, and common variations\n- **Browse equipment** — Navigate by brand (Trane, Johnson Controls, Honeywell, etc.) and drill into types and models\n- **Contribute** — Atlas is community-driven. Submit corrections, add equipment notes, and help fill in the gaps\n\n## Try it now\n\nAtlas is live and free at `/atlas`. The more people use it and contribute, the more useful it becomes for everyone.\n\nWhat points or equipment would you like to see added? Let us know below.',
  'bas-atlas-reference-guide',
  ARRAY['atlas', 'point-naming', 'equipment', 'bacnet', 'standards'],
  true,
  true,
  '{"announcement": true}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- POST 3: Open source Rust packages
-- ============================================================
INSERT INTO public.pointstack_posts (
  author_id, post_type, title, content, slug, tags, is_published, is_pinned, metadata
)
VALUES (
  '74c2b81d-db84-46c0-bdf9-6e09bb12d3df',
  'discussion',
  'Open Source Rust Crates for BAS — Starting with BACnet and Modbus',
  E'We''re releasing open source Rust crates for building automation protocol communication. If you write BAS software (or want to start), these are for you.\n\n## The crates\n\n### rustbac — BACnet in Rust\n\nA Rust crate for BACnet/IP communication. Encode and decode BACnet packets, read/write properties, handle COV subscriptions, and work with device objects — all in safe, performant Rust.\n\nGitHub: `github.com/rbhans/rust-bac`\n\n### rustmod — Modbus in Rust\n\nA Rust crate for Modbus TCP and RTU communication. Read/write registers, handle coils, and integrate Modbus devices into Rust-based applications.\n\nGitHub: `github.com/rbhans/rust-mod`\n\n## Why Rust for BAS?\n\nMost BAS protocol libraries are written in Java, C#, or Python. Rust brings a few things to the table that matter for embedded and edge computing in buildings:\n\n- **Memory safety without garbage collection** — no null pointer crashes in your supervisory controller\n- **Performance** — compiled native code runs fast on resource-constrained edge devices\n- **Concurrency** — safe multi-threaded communication with multiple devices simultaneously\n- **Small binaries** — deploy lightweight protocol bridges on ARM boards and gateways\n\n## What''s the vision?\n\nWe want a complete, open source Rust protocol stack for buildings:\n\n- BACnet/IP and BACnet/MSTP\n- Modbus TCP and RTU\n- KNX, LonWorks, and other protocols as demand grows\n\nThese crates are building blocks. Use them to build custom integrations, write your own supervisory applications, or contribute protocol support back to the community.\n\n## Get involved\n\nBoth crates are MIT licensed. PRs, issues, and feedback are welcome. If you''ve worked with BACnet or Modbus in Rust (or want to), we''d love to collaborate.\n\nCheck out the resources page at `/resources/rust` for links and documentation.',
  'open-source-rust-crates-bas',
  ARRAY['rust', 'bacnet', 'modbus', 'open-source', 'programming'],
  true,
  false,
  '{}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
