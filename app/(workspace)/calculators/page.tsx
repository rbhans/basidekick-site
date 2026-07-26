import type { Metadata } from "next";
import { CalculatorExplorer } from "@/components/calculator-explorer";
export const metadata: Metadata = { title: "Calculators", description: "Free BAS and HVAC engineering calculators." };
export default function CalculatorsPage() { return <CalculatorExplorer />; }
