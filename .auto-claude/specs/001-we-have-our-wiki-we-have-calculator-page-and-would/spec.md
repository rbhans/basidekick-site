# Specification: BAS References Page

## Overview

Create a new "References" page for the Basidekick wiki that provides quick reference materials for building automation professionals. Similar to the existing calculators page in purpose, this page will serve as a quick-lookup resource for common industry terminology, protocol specifications, equipment abbreviations, and technical reference data. The page will follow the established pattern of collapsible sections with organized reference content.

## Workflow Type

**Type**: feature

**Rationale**: This is a new feature implementation requiring creation of new page routes, view components, and reference data. It follows established patterns from the calculators page but creates entirely new content and functionality.

## Task Scope

### Services Involved
- **Frontend (Next.js)** (primary) - Creating new page route and view component
- **Navigation System** (integration) - Adding route and nav item to existing navigation

### This Task Will:
- [ ] Create a new `/references` route at `app/(main)/references/page.tsx`
- [ ] Create `components/views/references-view.tsx` with reference content sections
- [ ] Add REFERENCES constant to `lib/types.ts` (VIEW_IDS)
- [ ] Add REFERENCES route to `lib/routes.ts`
- [ ] Add REFERENCES to navigation in `lib/constants.ts` (NAV_ITEMS, VIEW_TITLES)
- [ ] Update route mapping functions in `lib/routes.ts`
- [ ] Implement collapsible reference sections (BACnet, Modbus, HVAC, Electrical, etc.)
- [ ] Add searchable/filterable reference tables where appropriate

### Out of Scope:
- Backend/database changes
- User authentication for references
- API endpoints
- Downloadable PDF exports
- External data sources (all data is static)

## Service Context

### Frontend (Next.js)

**Tech Stack:**
- Language: TypeScript
- Framework: Next.js 16.1.1 with App Router
- UI: React 19.2.3 with functional components
- Styling: TailwindCSS v4 with custom theme
- Icons: Phosphor Icons 2.1.10
- Key directories: `app/(main)/`, `components/views/`, `lib/`

**Entry Point:** `app/(main)/references/page.tsx`

**How to Run:**
```bash
npm run dev
```

**Port:** 3000

## Files to Modify

| File | Service | What to Change |
|------|---------|---------------|
| `lib/types.ts` | Frontend | Add `REFERENCES: "references"` to VIEW_IDS constant |
| `lib/routes.ts` | Frontend | Add REFERENCES route constant and update mapping functions |
| `lib/constants.ts` | Frontend | Add to VIEW_TITLES, VIEW_LOADING_TEXT, and NAV_ITEMS |

## Files to Create

| File | Service | Description |
|------|---------|-------------|
| `app/(main)/references/page.tsx` | Frontend | Page route component (simple wrapper) |
| `components/views/references-view.tsx` | Frontend | Main view component with reference content |

## Files to Reference

These files show patterns to follow:

| File | Pattern to Copy |
|------|----------------|
| `app/(main)/calculators/page.tsx` | Page wrapper pattern |
| `components/views/calculators-view.tsx` | Section component, collapsible UI, layout structure |
| `components/views/resources-view.tsx` | Card layout pattern for simpler sections |
| `lib/routes.ts` | Route constant and mapping patterns |
| `lib/types.ts` | VIEW_IDS constant pattern |
| `lib/constants.ts` | Navigation item structure |

## Patterns to Follow

### Page Component Pattern

From `app/(main)/calculators/page.tsx`:

```tsx
import { ReferencesView } from "@/components/views/references-view";

export default function ReferencesPage() {
  return <ReferencesView />;
}
```

**Key Points:**
- Simple wrapper component
- Named export for the view component
- Default export for the page

### Collapsible Section Component Pattern

From `components/views/calculators-view.tsx`:

```tsx
function Section({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-card/80 border border-border transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="text-primary">{icon}</span>
          <span className="font-semibold">{title}</span>
        </div>
        <CaretDown
          className={`size-5 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="mt-1 p-4 bg-card/50 border border-border border-t-0">
          {children}
        </div>
      )}
    </div>
  );
}
```

**Key Points:**
- Uses useState for open/close state
- Consistent styling with `bg-card`, `border-border`
- CaretDown icon rotates on toggle
- Hover state on button

### Header Pattern

From `components/views/calculators-view.tsx`:

```tsx
<section className="relative py-12 overflow-hidden">
  <CircuitBackground opacity={0.15} />
  <div className="container mx-auto px-4 relative z-10">
    <SectionLabel>resources</SectionLabel>
    <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
      BAS References
    </h1>
    <p className="mt-3 text-muted-foreground max-w-xl">
      Quick reference for building automation professionals.
    </p>
  </div>
</section>
```

**Key Points:**
- CircuitBackground with opacity
- SectionLabel component for category
- Responsive text sizing
- Container with max-w-5xl for content

### VIEW_ID and Route Pattern

From `lib/types.ts`:

```tsx
export const VIEW_IDS = {
  // ... existing
  REFERENCES: "references",
} as const;
```

From `lib/routes.ts`:

```tsx
export const ROUTES = {
  // ... existing
  REFERENCES: "/references",
} as const;
```

### Navigation Item Pattern

From `lib/constants.ts`:

```tsx
{
  id: VIEW_IDS.RESOURCES,
  label: "RESOURCES",
  iconName: "Book",
  defaultExpanded: true,
  children: [
    { id: VIEW_IDS.WIKI, label: "Wiki", iconName: "BookOpen" },
    { id: VIEW_IDS.FORUM, label: "Forum", iconName: "Chats" },
    { id: VIEW_IDS.CALCULATORS, label: "Calculators", iconName: "Calculator" },
    { id: VIEW_IDS.REFERENCES, label: "References", iconName: "ListChecks" }, // ADD THIS
    { id: VIEW_IDS.PSK, label: "ProjectSidekick", iconName: "Kanban" },
  ],
},
```

## Requirements

### Functional Requirements

1. **BACnet Object Types Reference**
   - Description: Table of all standard BACnet object types with codes, names, and descriptions
   - Acceptance: Displays object types (AI, AO, AV, BI, BO, BV, MSI, MSO, MSV, Device, Schedule, Calendar, etc.) with their numeric codes and brief descriptions

2. **BACnet Common Properties Reference**
   - Description: Table of frequently used BACnet properties
   - Acceptance: Shows Present_Value, Object_Identifier, Object_Name, Status_Flags, Description, Units, COV_Increment, etc.

3. **Modbus Register Types Reference**
   - Description: Reference table for Modbus register types and function codes
   - Acceptance: Displays Coils, Discrete Inputs, Input Registers, Holding Registers with address ranges and function codes

4. **HVAC Equipment Abbreviations**
   - Description: Common HVAC equipment abbreviations used in BAS
   - Acceptance: Shows AHU, VAV, FCU, RTU, MAU, ERV, HRV, CHW, HHW, CWS, CWR, etc.

5. **Controls & Systems Abbreviations**
   - Description: Common controls and systems terminology
   - Acceptance: Shows DDC, BAS, EMS, SCADA, HMI, PLC, PID, etc.

6. **Common Setpoints Reference**
   - Description: Standard temperature and pressure setpoints
   - Acceptance: Shows typical cooling/heating setpoints, duct static pressure setpoints, chilled water temps, etc.

7. **Collapsible Sections**
   - Description: Reference data organized into collapsible sections
   - Acceptance: Each category can be expanded/collapsed, first section open by default

8. **Responsive Layout**
   - Description: Page works on mobile and desktop
   - Acceptance: Tables scroll horizontally on mobile, layout adapts to screen size

### Edge Cases

1. **Long table content** - Tables should be scrollable within sections
2. **Empty sections** - Should not occur as all data is static, but handle gracefully if it does
3. **Icon not found** - Use fallback icon (Info or similar)

## Implementation Notes

### DO
- Follow the exact pattern from `calculators-view.tsx` for Section component
- Use the same header pattern with CircuitBackground and SectionLabel
- Use themed classes: `bg-card`, `border-border`, `text-primary`, `text-muted-foreground`
- Add `'use client'` directive at top of view component
- Import icons from `@phosphor-icons/react`
- Keep reference data as static TypeScript arrays/objects within the component
- Use consistent table styling with headers and alternating row colors

### DON'T
- Create new UI components when existing patterns work
- Import data from external sources or API
- Add complex interactivity beyond collapsible sections
- Skip the CircuitBackground header pattern
- Use different styling than existing pages
- Forget to add to navigation in lib/constants.ts

## Development Environment

### Start Services

```bash
npm run dev
```

### Service URLs
- Frontend: http://localhost:3000

### Required Environment Variables
- None required for this feature (static content)

## Reference Content Categories

The following reference sections should be implemented:

### 1. BACnet Object Types
| Code | Abbreviation | Name | Description |
|------|--------------|------|-------------|
| 0 | AI | Analog Input | Sensor readings |
| 1 | AO | Analog Output | Control outputs |
| 2 | AV | Analog Value | Setpoints, calculations |
| 3 | BI | Binary Input | Status points |
| 4 | BO | Binary Output | On/Off control |
| 5 | BV | Binary Value | Modes, enables |
| 8 | DEV | Device | Device object |
| 13 | MSI | Multi-state Input | Multi-position status |
| 14 | MSO | Multi-state Output | Multi-position control |
| 19 | MSV | Multi-state Value | Operating modes |
| 17 | SCH | Schedule | Time schedules |
| 6 | CAL | Calendar | Holiday calendars |
| 20 | TL | Trend Log | Historical data |
| 15 | NC | Notification Class | Alarm routing |

### 2. Modbus Register Types
| Type | Address Range | Access | Function Codes |
|------|---------------|--------|----------------|
| Coils | 00001-09999 | R/W | FC01, FC05, FC15 |
| Discrete Inputs | 10001-19999 | R/O | FC02 |
| Input Registers | 30001-39999 | R/O | FC04 |
| Holding Registers | 40001-49999 | R/W | FC03, FC06, FC16 |

### 3. HVAC Equipment Abbreviations
- AHU - Air Handling Unit
- VAV - Variable Air Volume
- FCU - Fan Coil Unit
- RTU - Rooftop Unit
- MAU - Makeup Air Unit
- ERV/HRV - Energy/Heat Recovery Ventilator
- DX - Direct Expansion
- VRF/VRV - Variable Refrigerant Flow/Volume

### 4. Piping & Fluids
- CHW - Chilled Water
- HHW - Hot/Heating Water
- CWS - Condenser Water Supply
- CWR - Condenser Water Return
- GPM - Gallons Per Minute
- PSI - Pounds Per Square Inch

### 5. Controls Abbreviations
- DDC - Direct Digital Control
- BAS - Building Automation System
- EMS - Energy Management System
- PID - Proportional-Integral-Derivative
- COV - Change of Value
- MSTP - Master-Slave Token Passing

### 6. Electrical & Power
- VFD - Variable Frequency Drive
- kW - Kilowatt
- kVA - Kilovolt-Ampere
- PF - Power Factor
- CT - Current Transformer

## Success Criteria

The task is complete when:

1. [ ] New route `/references` loads without errors
2. [ ] References page displays with correct header (CircuitBackground, SectionLabel, title)
3. [ ] At least 5 collapsible sections are implemented with reference data
4. [ ] Navigation shows "References" under Resources in sidebar
5. [ ] Clicking References in nav navigates to /references
6. [ ] First section opens by default, others collapsed
7. [ ] Page is responsive (works on mobile and desktop)
8. [ ] No console errors
9. [ ] Existing tests still pass
10. [ ] Page style matches calculators page aesthetic

## QA Acceptance Criteria

**CRITICAL**: These criteria must be verified by the QA Agent before sign-off.

### Unit Tests
| Test | File | What to Verify |
|------|------|----------------|
| Route exists | `app/(main)/references/page.tsx` | Component renders without crashing |
| View renders | `components/views/references-view.tsx` | All sections render correctly |
| Navigation includes References | `lib/constants.ts` | References appears in NAV_ITEMS |

### Integration Tests
| Test | Services | What to Verify |
|------|----------|----------------|
| Navigation routing | Frontend | Clicking References nav item navigates to /references |
| Route mapping | Frontend | getViewIdFromPath returns correct ID for /references |

### End-to-End Tests
| Flow | Steps | Expected Outcome |
|------|-------|------------------|
| Navigate to References | 1. Load home page 2. Click References in sidebar | References page loads with all sections |
| Toggle sections | 1. Go to /references 2. Click section headers | Sections expand/collapse correctly |
| Verify content | 1. Go to /references 2. Expand all sections | All reference tables display data |

### Browser Verification (if frontend)
| Page/Component | URL | Checks |
|----------------|-----|--------|
| References Page | `http://localhost:3000/references` | Page loads, header displays, sections work |
| Mobile view | `http://localhost:3000/references` (responsive) | Layout adapts, tables scrollable |
| Dark mode | `http://localhost:3000/references` | Colors correct in dark theme |

### Database Verification (if applicable)
N/A - No database changes required for this feature.

### QA Sign-off Requirements
- [ ] References page loads at /references
- [ ] Header matches calculators page pattern (CircuitBackground, SectionLabel)
- [ ] All reference sections are present and populated
- [ ] Collapsible sections work correctly
- [ ] Navigation includes References item
- [ ] No regressions in existing functionality
- [ ] Code follows established patterns from calculators-view.tsx
- [ ] No security vulnerabilities introduced
- [ ] Responsive design works on mobile
- [ ] Dark mode renders correctly
