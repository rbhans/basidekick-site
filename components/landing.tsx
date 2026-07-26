import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Command,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";

export function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link className="brand-lockup" href="/"><BrandMark /><strong>BASidekick</strong></Link>
        <nav><a href="#workspace">Workspace</a><a href="#areas">What’s inside</a><a href="#principles">Principles</a></nav>
        <div><ThemeToggle compact /><Link className="button quiet" href="/signin">Sign in</Link><Link className="button primary" href="/dashboard">Open workspace <ArrowRight size={15} /></Link></div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-art" aria-hidden="true" />
          <div className="hero-layout">
            <div className="hero-copy">
              <span className="eyebrow"><i />AN INDEPENDENT BAS WORKSPACE</span>
              <h1>The BAS <span>workspace.</span></h1>
              <p>Field knowledge, calculators, industry signal, and people who do the work—all together in one public workspace.</p>
              <div className="hero-actions"><Link className="button primary large" href="/dashboard">Open BASidekick <ArrowRight size={17} /></Link><Link className="button quiet large" href="/wiki">Browse the Wiki</Link></div>
              <div className="hero-proof"><span><CheckCircle weight="fill" /> Free to read</span><span><CheckCircle weight="fill" /> Vendor-independent</span><span><CheckCircle weight="fill" /> Sources stay attached</span></div>
            </div>
          </div>
        </section>

        <div className="workspace-preview" id="workspace" aria-label="Preview of the BASidekick workspace">
          <aside>
            <div className="preview-brand"><BrandMark /><b>BASidekick</b></div>
            <div className="preview-search"><MagnifyingGlass size={13} /> Search <kbd>⌘K</kbd></div>
            {['Dashboard','Atlas  ·  Soon','Wiki','Courses','News','PointStack Social','Tools'].map((item, index) => <span className={index === 0 ? "active" : ""} key={item}>{item}</span>)}
          </aside>
          <div className="preview-main">
            <header><span>Workspace / Dashboard</span><Command size={14} /></header>
            <section>
              <div className="preview-heading"><small>GOOD MORNING</small><h2>Building automation, in one place.</h2></div>
              <div className="preview-grid"><div><small>INDUSTRY SIGNAL</small><b>BACnet/SC moves into field practice</b><span>News · 2d</span></div><div><small>POINTSTACK</small><b>VAV optimization at a downtown office</b><span>Project · 4 replies</span></div></div>
              <div className="preview-list"><span><i>WIKI</i><b>BAS network hardening checklist</b><small>Updated Jun 22</small></span><span><i>TOOLS</i><b>BTU from flow</b><small>Calculator</small></span><span><i>LIBRARY</i><b>BASk Stream</b><small>Open source</small></span></div>
            </section>
          </div>
        </div>

        <section className="landing-strip"><span><i /> SOURCES NOMINAL</span><span>Built for controls technicians</span><span>Systems integrators</span><span>Commissioning agents</span><span>Controls engineers</span></section>

        <section className="landing-section" id="areas">
          <div className="landing-section-head"><h2>Dense where you scan. Quiet where you read.</h2><p>Every section follows the same app language: fast search, useful metadata, real sources, and no trade-show filler.</p><span className="control-rule" aria-hidden="true"><i /><i /></span></div>
          <div className="landing-feature-grid">
            <Link className="feature-card-wide" href="/wiki">
              <span>FIELD KNOWLEDGE</span>
              <div className="feature-card-body">
                <div className="feature-card-copy">
                  <h3>Wiki + Courses</h3>
                  <p>Field-tested guides, troubleshooting, and a clear starting path for people entering BAS.</p>
                  <div className="feature-register"><span><b>BACnet/SC</b><small>Implementation guide</small></span><span><b>Network hardening</b><small>Field checklist</small></span><span><b>Niagara histories</b><small>Troubleshooting</small></span></div>
                  <em>Explore knowledge <ArrowRight size={14} /></em>
                </div>
                <div className="feature-art" data-art="wiki" aria-hidden="true" />
              </div>
            </Link>
            <Link href="/pointstack"><span>TRADE DESK</span><div className="feature-art" data-art="pointstack" aria-hidden="true" /><h3>PointStack Social</h3><p>Projects, questions, people, companies, and jobs in a community scoped to building automation.</p><em>See the network <ArrowRight size={14} /></em></Link>
            <Link href="/tools"><span>WORKBENCH</span><div className="feature-art" data-art="tools" aria-hidden="true" /><h3>Tools + Library</h3><p>Calculators, quick references, software, modules, scripts, PDFs, and externally published resources.</p><em>Open tools <ArrowRight size={14} /></em></Link>
          </div>
        </section>

        <section className="atlas-returning">
          <div><span className="eyebrow">ATLAS / RETURNING SOON</span><h2>The naming reference is being rebuilt.</h2><p>Atlas will return with a new data model and interface for points, equipment, brands, and aliases.</p></div>
          <Link className="button inverse" href="/atlas">See the status <ArrowRight size={15} /></Link>
        </section>

        <section className="landing-section principles" id="principles">
          <div className="landing-section-head"><h2>Useful first. Open when possible.</h2></div>
          <div className="principle-list"><div><b>PUBLIC</b><h3>Read without an account</h3><p>Authentication unlocks contribution and personalization, not basic access.</p></div><div><b>SOURCED</b><h3>Keep the source attached</h3><p>Standards, vendor documents, public advisories, and community knowledge stay distinguishable.</p></div><div><b>DIRECT</b><h3>Let creators own the transaction</h3><p>Paid resources link to the creator. BASidekick does not insert itself into the purchase.</p></div></div>
        </section>

        <section className="landing-cta"><BrandMark /><h2>Pull up the BAS workspace.</h2><p>Browse the public workspace now. Sign in only when you’re ready to contribute.</p><Link className="button primary large" href="/dashboard">Open BASidekick <ArrowRight size={17} /></Link></section>
      </main>

      <footer className="landing-footer"><div className="brand-lockup"><BrandMark /><strong>BASidekick</strong></div><p>Independent BAS reference, tools, and community. Built by Rob in Tucson.</p><nav><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href="https://github.com/rbhans">GitHub</a></nav></footer>
    </div>
  );
}
