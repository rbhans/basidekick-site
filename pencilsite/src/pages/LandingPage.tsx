import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Globe,
  GraduationCap,
  Wrench,
  BookOpen,
  Terminal,
  Map,
  Calculator,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
  Layers,
  Database,
  Sparkles,
  Box,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MessengerWidget from '../components/MessengerWidget';
import Badge from '../components/Badge';
import ResourceCard from '../components/ResourceCard';
import ArticleCard from '../components/ArticleCard';

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C4F82A]/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#C4F82A]/3 via-transparent to-[#C4F82A]/3" />
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-[#C4F82A]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#C4F82A]/3 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center text-center pt-24 pb-20 px-6">
          <h1 className="font-grotesk text-[56px] font-bold leading-tight mb-6">
            <span className="text-white">Tools, community, and </span>
            <span className="text-[#C4F82A]">knowledge.</span>
          </h1>
          <p className="font-manrope text-[20px] text-[#A1A1AA] max-w-[640px] mb-10 leading-relaxed">
            Assistive tools, shared knowledge, and a community for BAS professionals.
          </p>
          <div className="flex items-center gap-4 mb-16">
            <Link
              to="/tools"
              className="h-12 px-7 bg-[#C4F82A] text-[#0A0A0A] font-manrope text-[15px] font-semibold rounded-lg flex items-center gap-2 hover:bg-[#d4ff5a] transition-colors shadow-lg shadow-[#C4F82A]/20"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/wiki"
              className="h-12 px-7 bg-transparent border border-[#3F3F46] text-white font-manrope text-[15px] font-semibold rounded-lg flex items-center hover:border-[#52525B] transition-colors"
            >
              Browse Wiki
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="bg-[#18181BDD] border border-[#27272A] rounded-2xl px-10 py-5 flex items-center gap-0 backdrop-blur-sm">
            <div className="flex items-center gap-4 px-6">
              <div className="w-10 h-10 rounded-full bg-[#27272A] flex items-center justify-center">
                <Users className="w-5 h-5 text-[#C4F82A]" />
              </div>
              <div>
                <p className="font-grotesk text-[22px] font-bold text-white">1,200+</p>
                <p className="font-manrope text-[13px] text-[#A1A1AA]">BAS Professionals</p>
              </div>
            </div>
            <div className="w-px h-12 bg-[#27272A]" />
            <div className="flex items-center gap-4 px-6">
              <div className="w-10 h-10 rounded-full bg-[#27272A] flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#C4F82A]" />
              </div>
              <div>
                <p className="font-grotesk text-[22px] font-bold text-white">314+</p>
                <p className="font-manrope text-[13px] text-[#A1A1AA]">Point Definitions</p>
              </div>
            </div>
            <div className="w-px h-12 bg-[#27272A]" />
            <div className="flex items-center gap-4 px-6">
              <div className="w-10 h-10 rounded-full bg-[#27272A] flex items-center justify-center">
                <Database className="w-5 h-5 text-[#C4F82A]" />
              </div>
              <div>
                <p className="font-grotesk text-[22px] font-bold text-white">125+</p>
                <p className="font-manrope text-[13px] text-[#A1A1AA]">Equipment Entries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAS Atlas Featured Section */}
      <section className="bg-[#18181B] py-16 px-[80px]">
        <div className="flex gap-16 items-start">
          <div className="w-[520px] shrink-0">
            <div className="mb-6">
              <Badge label="BAS ATLAS" icon={Globe} />
            </div>
            <h2 className="font-grotesk text-[36px] font-bold mb-4 leading-tight">
              <span className="text-white">An open source, community-driven reference for </span>
              <span className="text-[#C4F82A]">BAS professionals</span>
            </h2>
            <p className="font-manrope text-[16px] text-[#A1A1AA] leading-relaxed mb-8">
              Explore standardized point definitions, equipment catalogs, and naming conventions all in one place.
              Built on Haystack and Brick standards — open source and actively growing with community contributions.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/atlas"
                className="h-11 px-6 bg-[#C4F82A] text-[#0A0A0A] font-manrope text-[14px] font-semibold rounded-lg flex items-center gap-2 hover:bg-[#d4ff5a] transition-colors"
              >
                Explore Atlas
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/atlas"
                className="h-11 px-6 bg-transparent border border-[#3F3F46] text-white font-manrope text-[14px] font-semibold rounded-lg flex items-center hover:border-[#52525B] transition-colors"
              >
                Equipment Catalog
              </Link>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-[#0A0A0A] border border-[#27272A] rounded-xl p-5 hover:border-[#3F3F46] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center mb-3">
                <Layers className="w-5 h-5 text-[#C4F82A]" />
              </div>
              <p className="font-grotesk text-[22px] font-bold text-[#C4F82A] mb-1">314+</p>
              <p className="font-mono text-[11px] font-bold text-[#C4F82A] tracking-[1px] uppercase mb-1">
                Points
              </p>
              <p className="font-manrope text-[12px] text-[#A1A1AA]">
                Standardized BAS point definitions with naming conventions
              </p>
            </div>
            <div className="bg-[#0A0A0A] border border-[#27272A] rounded-xl p-5 hover:border-[#3F3F46] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center mb-3">
                <Box className="w-5 h-5 text-[#C4F82A]" />
              </div>
              <p className="font-grotesk text-[22px] font-bold text-[#C4F82A] mb-1">125+</p>
              <p className="font-mono text-[11px] font-bold text-[#C4F82A] tracking-[1px] uppercase mb-1">
                Equipment
              </p>
              <p className="font-manrope text-[12px] text-[#A1A1AA]">
                Community-driven equipment catalog, growing with contributions
              </p>
            </div>
            <div className="bg-[#0A0A0A] border border-[#27272A] rounded-xl p-5 hover:border-[#3F3F46] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center mb-3">
                <ClipboardList className="w-5 h-5 text-[#C4F82A]" />
              </div>
              <p className="font-grotesk text-[22px] font-bold text-[#C4F82A] mb-1">Haystack/Brick</p>
              <p className="font-mono text-[11px] font-bold text-[#C4F82A] tracking-[1px] uppercase mb-1">
                Standards
              </p>
              <p className="font-manrope text-[12px] text-[#A1A1AA]">
                Built on industry-leading semantic data modeling standards
              </p>
            </div>
            <div className="bg-[#0A0A0A] border border-[#27272A] rounded-xl p-5 hover:border-[#3F3F46] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#27272A] flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-[#C4F82A]" />
              </div>
              <p className="font-grotesk text-[22px] font-bold text-[#C4F82A] mb-1">Cleaner</p>
              <p className="font-mono text-[11px] font-bold text-[#C4F82A] tracking-[1px] uppercase mb-1">
                Data Quality
              </p>
              <p className="font-manrope text-[12px] text-[#A1A1AA]">
                Consistent naming, tagging, and categorization across all entries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wiki Carousel Section */}
      <section className="bg-[#18181B] py-12 px-[80px] border-t border-[#27272A]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge label="WIKI" icon={GraduationCap} />
            <p className="font-manrope text-[14px] text-[#A1A1AA]">
              Latest articles and guides for BAS professionals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/wiki"
              className="font-manrope text-[13px] font-semibold text-[#C4F82A] hover:text-[#d4ff5a] transition-colors"
            >
              Browse All
            </Link>
            <button className="w-9 h-9 rounded-lg border border-[#27272A] flex items-center justify-center hover:border-[#3F3F46] transition-colors">
              <ChevronLeft className="w-4 h-4 text-[#A1A1AA]" />
            </button>
            <button className="w-9 h-9 rounded-lg border border-[#27272A] flex items-center justify-center hover:border-[#3F3F46] transition-colors">
              <ChevronRight className="w-4 h-4 text-[#A1A1AA]" />
            </button>
          </div>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          <div className="w-[380px] shrink-0">
            <ArticleCard
              category="Networking"
              title="Understanding BACnet MS/TP Networks"
              description="A comprehensive guide to BACnet MS/TP networking topology, wiring best practices, and troubleshooting common issues."
              readTime="8 min read"
              accentColor="#C4F82A"
            />
          </div>
          <div className="w-[380px] shrink-0">
            <ArticleCard
              category="Programming"
              title="Sequences of Operation Best Practices"
              description="Learn how to write clear, maintainable sequences of operation for HVAC control systems."
              readTime="12 min read"
              accentColor="#3B82F6"
            />
          </div>
          <div className="w-[380px] shrink-0">
            <ArticleCard
              category="Standards"
              title="Introduction to Project Haystack"
              description="Get started with Project Haystack tagging conventions and how they improve BAS data interoperability."
              readTime="6 min read"
              accentColor="#F59E0B"
            />
          </div>
          <div className="w-[380px] shrink-0">
            <ArticleCard
              category="Commissioning"
              title="BAS Commissioning Checklist"
              description="A step-by-step commissioning checklist covering network verification, point checkout, and system validation."
              readTime="10 min read"
              accentColor="#8B5CF6"
            />
          </div>
          <div className="w-[380px] shrink-0">
            <ArticleCard
              category="Cybersecurity"
              title="Securing BAS Networks"
              description="Essential cybersecurity practices for building automation systems including segmentation, access control, and monitoring."
              readTime="9 min read"
              accentColor="#EF4444"
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-[#C4F82A]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#3F3F46]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#3F3F46]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#3F3F46]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#3F3F46]" />
        </div>
      </section>

      {/* Tools Section */}
      <section className="bg-[#0A0A0A] py-[60px] px-[80px]">
        <div className="mb-10">
          <Badge label="TOOLS" icon={Wrench} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* SimulatorSidekick Card */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-6 hover:border-[#3F3F46] transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#27272A] flex items-center justify-center">
                <span className="font-mono text-[14px] font-bold text-[#C4F82A]">SIM</span>
              </div>
              <div>
                <h3 className="font-grotesk text-[18px] font-bold text-white">SimulatorSidekick</h3>
                <p className="font-manrope text-[13px] text-[#A1A1AA]">Virtual Device Simulator</p>
              </div>
            </div>
            <p className="font-manrope text-[14px] text-[#A1A1AA] leading-relaxed mb-5">
              Simulate BACnet, Modbus, and LON devices for testing and development without physical hardware.
              Build virtual networks, test integrations, and validate sequences of operation.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FA541C]/10 border border-[#FA541C]/30">
                <span className="font-mono text-[11px] font-bold text-[#FA541C] tracking-[1px]">
                  COMING SOON
                </span>
              </span>
              <Link
                to="/tools"
                className="font-manrope text-[13px] font-semibold text-[#C4F82A] hover:text-[#d4ff5a] transition-colors"
              >
                Learn More &rarr;
              </Link>
            </div>
          </div>

          {/* QR Sidekick Card */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-6 hover:border-[#3F3F46] transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#27272A] flex items-center justify-center">
                <span className="font-mono text-[14px] font-bold text-[#C4F82A]">QSK</span>
              </div>
              <div>
                <h3 className="font-grotesk text-[18px] font-bold text-white">QR Sidekick</h3>
                <p className="font-manrope text-[13px] text-[#A1A1AA]">QR Code Equipment Manager</p>
              </div>
            </div>
            <p className="font-manrope text-[14px] text-[#A1A1AA] leading-relaxed mb-5">
              Generate and manage QR codes for BAS equipment. Scan to access device documentation,
              maintenance history, and point mappings instantly in the field.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FA541C]/10 border border-[#FA541C]/30">
                <span className="font-mono text-[11px] font-bold text-[#FA541C] tracking-[1px]">
                  COMING SOON
                </span>
              </span>
              <Link
                to="/tools"
                className="font-manrope text-[13px] font-semibold text-[#C4F82A] hover:text-[#d4ff5a] transition-colors"
              >
                Learn More &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="bg-[#0A0A0A] pt-[60px] pb-16 px-[80px]">
        <div className="flex items-center justify-between mb-3">
          <Badge label="RESOURCES" icon={BookOpen} />
          <Link
            to="/atlas"
            className="font-manrope text-[13px] font-semibold text-[#C4F82A] hover:text-[#d4ff5a] transition-colors"
          >
            View All &rarr;
          </Link>
        </div>
        <p className="font-manrope text-[16px] text-[#A1A1AA] mb-8">
          Free tools and references for BAS professionals.
        </p>
        <div className="grid grid-cols-4 gap-5">
          <ResourceCard
            icon={Terminal}
            iconLabel="Rust"
            title="Rust BAS Tools"
            description="High-performance command-line tools built with Rust for BACnet discovery, point export, and network diagnostics."
            linkTo="/tools"
          />
          <ResourceCard
            icon={Map}
            iconLabel="BAS Atlas"
            title="BAS Atlas"
            description="Open source, community-driven reference for point definitions, equipment catalogs, and naming conventions. Actively growing."
            linkTo="/atlas"
          />
          <ResourceCard
            icon={Calculator}
            iconLabel="Calculators"
            title="BAS Calculators"
            description="Calculate CFM, BTU, tonnage, duct sizing, and other HVAC values with our free engineering calculators."
            linkTo="/tools"
          />
          <ResourceCard
            icon={FileText}
            iconLabel="References"
            title="Reference Sheets"
            description="Quick-reference sheets for BACnet object types, Modbus registers, network protocols, and common sequences."
            linkTo="/wiki"
          />
        </div>
      </section>

      <Footer />
      <MessengerWidget />
    </div>
  );
}

export default LandingPage;
