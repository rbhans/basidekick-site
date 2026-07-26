import type { Metadata } from "next";
import { LibrarySubmit } from "@/components/library-submit";
export const metadata: Metadata = { title: "Submit to Library", description: "Share a useful BAS resource." };
export default function LibrarySubmitPage() { return <LibrarySubmit />; }
