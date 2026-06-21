import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export function Footer() {
  return (
    <footer className="bg-sand">
      <div className="bsk-wrap py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 pb-9 border-b border-[var(--sand-line)] items-start">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <h4 className="font-sans font-extrabold text-[28px] tracking-[-0.02em] text-ink mb-2 m-0">
              BASidekick
              <span className="text-punch ml-1">→</span>
            </h4>
            <p className="text-ink-2 text-[14px] max-w-[36ch] m-0 leading-[1.55]">
              Independent BAS reference, community, and shared resource hub. Built &amp; maintained by Rob Hansen in Tucson.
            </p>
          </div>
          <FootCol heading="Reference">
            <FootLink href={ROUTES.ATLAS}>Atlas</FootLink>
            <FootLink href={ROUTES.WIKI}>Wiki</FootLink>
            <FootLink href="/references">References</FootLink>
            <FootLink href="/calculators">Calculators</FootLink>
          </FootCol>
          <FootCol heading="Community">
            <FootLink href={ROUTES.POINTSTACK}>PointStack</FootLink>
            <FootLink href={ROUTES.NEWS}>News</FootLink>
            <FootLink href="/pointstack/people">Experts</FootLink>
            <FootLink href="/pointstack/jobs">Open jobs</FootLink>
          </FootCol>
          <FootCol heading="Build">
            <FootLink href={ROUTES.OPEN_SOURCE}>Community Share</FootLink>
            <FootLink href="/api/atlas">API</FootLink>
            <a
              href="https://github.com/rbhans"
              target="_blank"
              rel="noreferrer"
              className="block py-1 text-[14px] text-ink-2 hover:text-punch transition-colors"
            >
              GitHub
            </a>
          </FootCol>
        </div>
        <div className="flex items-center gap-4 flex-wrap pt-5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
          <span>© {new Date().getFullYear()} Rob Hansen · Tucson, AZ · No investors. No ad networks.</span>
          <span className="ml-auto flex gap-5">
            <a
              href="https://github.com/rbhans"
              target="_blank"
              rel="noreferrer"
              className="hover:text-punch transition-colors"
            >
              GitHub
            </a>
            <Link href="/privacy" className="hover:text-punch transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-punch transition-colors">
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FootCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h6 className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-3 m-0 mb-3.5 font-medium">
        {heading}
      </h6>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block py-1 text-[14px] text-ink-2 hover:text-punch transition-colors">
      {children}
    </Link>
  );
}
