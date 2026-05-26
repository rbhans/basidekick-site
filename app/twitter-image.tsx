// Twitter card image — same render as the Open Graph image. Next.js looks
// for a default export here; re-export keeps the two visually in sync.
// If a future variant is needed (e.g. summary vs summary_large_image), fork here.
export { default, alt, size, contentType } from "./opengraph-image";
