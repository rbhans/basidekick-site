import type { Metadata } from "next";
import { CoursesView } from "@/components/feature-pages";
export const metadata: Metadata = { title: "Courses", description: "Self-paced building automation courses." };
export default function CoursesPage() { return <CoursesView />; }
