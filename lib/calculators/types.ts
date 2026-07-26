export type NumberInput = { key: string; kind: "number"; label: string; unit?: string; default?: string; step?: string };
export type SelectInput = { key: string; kind: "select"; label: string; options: { value: string; label: string }[]; default: string };
export type TextInput = { key: string; kind: "text"; label: string; placeholder?: string; default?: string };
export type CalcInput = NumberInput | SelectInput | TextInput;

export type CalcOutputRow = { label: string; value: string; unit?: string };

/**
 * compute receives RAW string values keyed by input.key; it parses internally
 * and returns output rows. On invalid/blank input, return rows with value "—".
 */
export type CalculatorDef = {
  id: string;
  title: string;
  note?: string;
  inputs: CalcInput[];
  compute: (v: Record<string, string>) => CalcOutputRow[];
};

export type CalcSection = { num: string; title: string; calculators: CalculatorDef[] };
