# Contributing (BAS Data API)

## Local Workflow
1. Install dependencies.
2. Run smoke tests:

```bash
pnpm api:smoke
```

3. Build production bundle:

```bash
pnpm build
```

## Data/API Guidelines
- Keep changes additive for public BAS payload contracts.
- Prefer shared logic in `lib/api/*` over duplicating route behavior.
- If new BAS dist fields are added upstream, extend `lib/types.ts` additively.
