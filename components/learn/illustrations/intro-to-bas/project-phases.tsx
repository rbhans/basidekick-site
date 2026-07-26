const PHASES = [
  { index: "01", name: "Pre-design", detail: "Requirements" },
  { index: "02", name: "Design", detail: "Sequences" },
  { index: "03", name: "Bid + award", detail: "Scope" },
  { index: "04", name: "Submittals", detail: "Controls plan" },
  { index: "05", name: "Construction", detail: "Install" },
  { index: "06", name: "Commissioning", detail: "Prove" },
  { index: "07", name: "Turnover", detail: "Operate" },
] as const;

const ROLES = [
  { name: "Owner", weights: [4, 3, 2, 1, 1, 2, 3] },
  { name: "Designer", weights: [3, 4, 3, 2, 1, 2, 1] },
  { name: "Integrator", weights: [1, 2, 3, 4, 4, 4, 3] },
  { name: "Operator", weights: [1, 1, 1, 1, 1, 2, 4] },
] as const;

export function ProjectPhasesDiagram({ caption }: { caption?: string }) {
  return (
    <figure className="project-phases-diagram">
      <div className="project-phase-ribbon" aria-label="Seven phases of a BAS project">
        {PHASES.map((phase) => <div key={phase.index}>
          <span>{phase.index}</span>
          <strong>{phase.name}</strong>
          <small>{phase.detail}</small>
        </div>)}
      </div>
      <div className="project-role-density" aria-label="Role involvement by project phase">
        {ROLES.map((role) => <div key={role.name}>
          <strong>{role.name}</strong>
          <span>{role.weights.map((weight, index) => <i style={{ opacity: 0.16 + weight * 0.2 }} key={`${role.name}-${index}`} />)}</span>
        </div>)}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
