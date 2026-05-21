import type { ReactNode } from "react";
import { ProgressProvider } from "@/lib/progress";

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}
