-- Add emerging BAS wiki entries for digital twins, MQTT/Sparkplug B,
-- BACnet/SC, Niagara semantic tagging, and Metasys role management.

-- Ensure new tags exist before article-tag linking.
INSERT INTO wiki_tags (name, slug)
VALUES
  ('digital-twin', 'digital-twin'),
  ('analytics', 'analytics'),
  ('iot', 'iot'),
  ('virtualization', 'virtualization'),
  ('data-modeling', 'data-modeling'),
  ('mqtt', 'mqtt'),
  ('sparkplug-b', 'sparkplug-b'),
  ('protocols', 'protocols'),
  ('integration', 'integration'),
  ('bacnet-sc', 'bacnet-sc'),
  ('encryption', 'encryption'),
  ('haystack', 'haystack'),
  ('brick', 'brick'),
  ('semantic-modeling', 'semantic-modeling'),
  ('tagging', 'tagging'),
  ('user-management', 'user-management'),
  ('access-control', 'access-control'),
  ('permissions', 'permissions')
ON CONFLICT (slug) DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 1: Digital Twin Applications in Building Automation
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'best-practices-general'),
  'Digital Twin Applications in Building Automation',
  'digital-twin-applications-building-automation',
  'Overview of digital twin concepts for BAS, including architecture, prerequisites, and practical use cases for optimization and fault detection.',
  E'# Digital Twin Applications in Building Automation\n\nA digital twin is a virtual representation of a physical building, system, or process that stays aligned with real operating conditions. In BAS, digital twins combine live telemetry, equipment metadata, and historical behavior so operators can analyze performance and simulate changes before making field adjustments.\n\n## Core Capabilities\n\n- Real-time visualization of building assets and systems\n- Simulation of control or load changes before implementation\n- Continuous comparison of expected vs. actual performance\n- Better root-cause analysis for recurring faults\n\n## Typical BAS Architecture\n\n1. Field devices and controllers publish equipment and point data\n2. Integration layers normalize naming and data models\n3. Analytics platform builds and maintains a digital representation\n4. Operators and engineers use dashboards, alarms, and simulation workflows\n\n## Prerequisites\n\n- Reliable telemetry from sensors, meters, and controllers\n- Consistent point naming and tagging strategy\n- Integration with cloud or on-prem analytics services\n- Governance for model versioning and validation\n\n## High-Value Use Cases\n\n- Chiller plant optimization and pump sequencing analysis\n- Predictive maintenance using trend and fault signatures\n- Energy optimization through scenario testing\n- Operational planning for occupancy or weather shifts\n\n## Implementation Guidance\n\n- Start with one subsystem (for example, central plant) before full-site rollout\n- Establish data quality checks for nulls, stale values, and bad units\n- Use semantic tags to map points to equipment and spaces\n- Validate simulation output against measured performance before automation\n\nDigital twins are most effective when combined with strong data modeling, repeatable tagging, and clear operating workflows.',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'digital-twin-applications-building-automation'),
  id
FROM wiki_tags
WHERE slug IN ('digital-twin', 'analytics', 'iot', 'virtualization', 'data-modeling')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 2: MQTT and Sparkplug B for IoT Integration in BAS
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'how-to-general'),
  'MQTT and Sparkplug B for IoT Integration in BAS',
  'mqtt-sparkplug-b-iot-integration-bas',
  'Guide to using MQTT and Sparkplug B for BAS integrations, including topic strategy, broker selection, and interoperability planning.',
  E'# MQTT and Sparkplug B for IoT Integration in BAS\n\nMQTT is a lightweight publish/subscribe protocol that allows BAS devices, gateways, and applications to exchange data through a broker. Sparkplug B builds on MQTT by standardizing topic structures and payload schemas so multi-vendor systems can interoperate more reliably.\n\n## Why Use MQTT in BAS\n\n- Report-by-exception messaging reduces unnecessary polling traffic\n- Decoupled architecture simplifies cross-network integrations\n- Efficient operation over constrained links\n- Flexible integration to cloud analytics and enterprise tools\n\n## Why Sparkplug B Matters\n\n- Standard namespace and message types across vendors\n- Consistent metric payloads with timestamps and data types\n- Better state awareness with birth/death certificates\n- Stronger foundation for unified namespace strategies\n\n## BAS Implementation Flow\n\n1. Select broker platform and define security requirements\n2. Define topic namespace and site/group conventions\n3. Normalize point naming and units before publish\n4. Publish telemetry and command channels with access controls\n5. Validate quality of service, retained messages, and failover behavior\n\n## Broker and Topic Best Practices\n\n- Use TLS and authenticated client identities\n- Keep topic hierarchies predictable and documented\n- Separate telemetry, alarms, and commands by namespace\n- Enforce ACLs to prevent unauthorized writes\n- Test reconnect and offline buffering behavior\n\n## MQTT vs Sparkplug B\n\n- MQTT alone gives transport flexibility and lightweight messaging\n- Sparkplug B adds interoperability rules and structured payloads\n- For multi-vendor OT deployments, Sparkplug B usually reduces integration risk\n\nA well-designed MQTT/Sparkplug architecture improves scalability and makes BAS data easier to consume across supervisory and analytics systems.',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'mqtt-sparkplug-b-iot-integration-bas'),
  id
FROM wiki_tags
WHERE slug IN ('mqtt', 'sparkplug-b', 'iot', 'protocols', 'integration', 'networking')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 3: BACnet Secure Connect (BACnet/SC) Implementation & Best Practices
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'best-practices-general'),
  'BACnet Secure Connect (BACnet/SC) Implementation & Best Practices',
  'bacnet-secure-connect-implementation-best-practices',
  'Practical BACnet/SC guidance covering architecture, certificates, migration planning, and security-focused deployment practices.',
  E'# BACnet Secure Connect (BACnet/SC) Implementation & Best Practices\n\nBACnet/SC modernizes BACnet communications by using encrypted, authenticated sessions rather than legacy broadcast-based BACnet/IP patterns. It is designed for security-sensitive and enterprise-connected BAS deployments where segmentation, certificate trust, and firewall compatibility are key requirements.\n\n## Security and Architecture Highlights\n\n- TLS-based encrypted communications\n- Certificate-based identity and trust validation\n- Hub-and-spoke model replacing broad broadcast discovery\n- Better compatibility with routed and segmented IT networks\n\n## Deployment Steps\n\n1. Define trust model and certificate authority approach\n2. Deploy and harden BACnet/SC hubs\n3. Provision certificates for hubs and nodes\n4. Configure routing and firewall policies\n5. Validate interoperability with existing BACnet/IP devices and routers\n\n## Benefits\n\n- Stronger protection against interception and spoofing risks\n- Better alignment with enterprise cybersecurity controls\n- Improved scalability across segmented environments\n\n## Challenges to Plan For\n\n- Certificate lifecycle and renewal management\n- Additional deployment complexity vs traditional BACnet/IP\n- Potential latency and design considerations in large topologies\n\n## Migration Best Practices\n\n- Start with a pilot segment before full cutover\n- Maintain clear inventory of BACnet/IP-only legacy devices\n- Use phased migration with gateway or mixed-network strategy\n- Document certificate ownership, expiry, and renewal process\n- Add monitoring for trust failures and session drops\n\nBACnet/SC strengthens BAS network security when paired with disciplined certificate operations and phased migration planning.',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'bacnet-secure-connect-implementation-best-practices'),
  id
FROM wiki_tags
WHERE slug IN ('bacnet-sc', 'security', 'encryption', 'networking', 'protocols', 'bacnet')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 4: Semantic Tagging and Modeling in Niagara - Haystack & Brick
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'best-practices-niagara'),
  'Semantic Tagging and Modeling in Niagara - Haystack & Brick',
  'semantic-tagging-modeling-niagara-haystack-brick',
  'Best-practice approach for applying Haystack and Brick semantics in Niagara to improve discoverability, interoperability, and analytics.',
  E'# Semantic Tagging and Modeling in Niagara - Haystack & Brick\n\nAs BAS data volumes grow, consistent semantics become essential. Haystack and Brick provide structured ways to describe equipment, points, spaces, and relationships so applications can interpret data without custom, site-specific logic.\n\n## Why Semantic Modeling Matters\n\n- Faster discovery of relevant points for analytics and dashboards\n- Better interoperability across tools and vendors\n- Reduced manual mapping effort during integrations\n- More reliable context for fault detection and reporting\n\n## Haystack in Niagara\n\nHaystack focuses on practical tagging conventions and data exchange patterns. In Niagara workflows, Haystack tags can standardize point meaning and support consistent extraction for downstream applications.\n\n## Brick in Niagara\n\nBrick provides ontology-style modeling of entities and relationships, including physical and logical context. It is useful when richer graph-style relationships and extensibility are needed.\n\n## Niagara Best Practices\n\n1. Define enterprise tagging standards before rollout\n2. Map points to equipment and spaces consistently\n3. Use Niagara Tag Dictionary capabilities to manage ontology context\n4. Validate tag quality with periodic audits and review workflows\n5. Keep a versioned tagging playbook for project teams\n\n## Haystack vs Brick (Practical View)\n\n- Haystack: simpler operational tagging, often faster to adopt\n- Brick: richer relationship modeling for complex analytics ecosystems\n- Many teams use both, with clear boundary rules by use case\n\nStrong semantic strategy in Niagara improves data usability, reduces integration friction, and supports long-term analytics maturity.',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'semantic-tagging-modeling-niagara-haystack-brick'),
  id
FROM wiki_tags
WHERE slug IN ('haystack', 'brick', 'semantic-modeling', 'tagging', 'niagara')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 5: Metasys User Roles and Permissions Management
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'best-practices-metasys'),
  'Metasys User Roles and Permissions Management',
  'metasys-user-roles-permissions-management',
  'Security-focused guide to Metasys account administration, role assignment, password policy, and least-privilege access management.',
  E'# Metasys User Roles and Permissions Management\n\nEffective user and permission management is central to securing a Metasys environment. Account design should balance operational access with auditability and risk reduction.\n\n## Core Account Policy\n\n- Create unique accounts for each operator\n- Avoid shared credentials for traceability and accountability\n- Enforce strong password standards and expiration policies\n- Configure session timeout and inactivity controls\n\n## Role and Permission Model\n\nMetasys environments commonly separate roles such as read-only users, operators, maintenance staff, and administrators. Every user should have only the minimum permissions required for their tasks.\n\n## Permission Best Practices\n\n1. Apply least-privilege defaults for all new accounts\n2. Use role-based templates to avoid ad hoc permission drift\n3. Restrict API access to approved service accounts only\n4. Define temporary access paths with explicit expiration dates\n5. Review and recertify privileged access on a regular schedule\n\n## Administrative Workflow\n\n- Provision users through Security Administrator processes\n- Assign roles and access type intentionally by job function\n- Document exception approvals for elevated access\n- Track account lifecycle events (create, modify, disable, remove)\n\n## Operational Guardrails\n\n- Restrict maintenance accounts to approved operational actions\n- Use tenant-level access for limited user audiences when appropriate\n- Log and review authentication failures and role changes\n\nA mature Metasys permission strategy reduces cyber risk, improves audit readiness, and prevents accidental operational impact from over-privileged accounts.',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'metasys-user-roles-permissions-management'),
  id
FROM wiki_tags
WHERE slug IN ('metasys', 'user-management', 'access-control', 'security', 'permissions')
ON CONFLICT DO NOTHING;
