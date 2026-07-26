import Link from "next/link";

export default function NotFound() {
  return <main className="status-page"><span className="eyebrow">404 / NOT FOUND</span><h1>That workspace path does not exist.</h1><p>It may have moved into Tools, Library, PointStack, or the returning Atlas.</p><Link className="button primary" href="/dashboard">Open dashboard</Link></main>;
}
