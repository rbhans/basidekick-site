import { section01 } from "./sections/01-sensor-signal";
import { section02 } from "./sections/02-airside";
import { section03 } from "./sections/03-network";
import { section04 } from "./sections/04-hydronic";
import { section05 } from "./sections/05-electrical";
import { section06 } from "./sections/06-psychrometrics";
import { section07 } from "./sections/07-scheduling";
import { section08 } from "./sections/08-commissioning";
import { section09 } from "./sections/09-energy";
import { section10 } from "./sections/10-controls";
import { section11 } from "./sections/11-conversions";
import type { CalcSection, CalculatorDef } from "./types";

export const SECTIONS: CalcSection[] = [
  section01,
  section02,
  section03,
  section04,
  section05,
  section06,
  section07,
  section08,
  section09,
  section10,
  section11,
];

export const ALL_CALCULATORS: CalculatorDef[] = SECTIONS.flatMap((s) => s.calculators);
