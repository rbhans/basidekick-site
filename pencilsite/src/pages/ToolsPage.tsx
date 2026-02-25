import {
  Wrench,
  ArrowRight,
  Play,
  Cpu,
  Network,
  Layers,
  TestTubes,
  QrCode,
  Smartphone,
  Database,
  CloudDownload,
  Wifi,
  Settings,
  Shield,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MessengerWidget from '../components/MessengerWidget';
import Badge from '../components/Badge';
import FeatureCard from '../components/FeatureCard';
import StepCard from '../components/StepCard';

function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Tools Hero */}
      <section className="py-16 px-[80px] text-center">
        <div className="flex justify-center mb-6">
          <Badge label="TOOLS" icon={Wrench} />
        </div>
        <h1 className="font-grotesk text-[42px] font-bold text-white mb-4">
          Built for BAS Professionals
        </h1>
        <p className="font-manrope text-[18px] text-[#A1A1AA] max-w-[600px] mx-auto mb-8">
          Purpose-built tools to streamline your building automation workflows, from simulation to field management.
        </p>
        <div className="w-full h-px bg-[#27272A]" />
      </section>

      {/* SimulatorSidekick Section */}
      <section className="py-12 px-[80px]">
        <div className="flex gap-12 items-start mb-12">
          {/* Left Column */}
          <div className="w-[500px] shrink-0">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[#27272A] flex items-center justify-center">
                <span className="font-mono text-[14px] font-bold text-[#C4F82A]">SIM</span>
              </div>
            </div>
            <h2 className="font-grotesk text-[28px] font-bold text-white mb-2">
              SimulatorSidekick
            </h2>
            <p className="font-manrope text-[16px] text-[#A1A1AA] mb-4">
              Virtual Device Simulator
            </p>
            <p className="font-manrope text-[14px] text-[#A1A1AA] leading-relaxed mb-6">
              Simulate BACnet, Modbus, and LON devices for testing and development without physical hardware.
              Create virtual device networks, test integrations and sequences of operation, and validate your
              programming before deploying to the field. Supports all common BAS protocols and object types.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#FA541C]/10 border border-[#FA541C]/30">
                <span className="font-mono text-[11px] font-bold text-[#FA541C] tracking-[1px]">
                  COMING SOON
                </span>
              </span>
              <button className="h-10 px-5 bg-[#C4F82A] text-[#0A0A0A] font-manrope text-[13px] font-semibold rounded-lg flex items-center gap-2 hover:bg-[#d4ff5a] transition-colors">
                Get Notified
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column - Demo Placeholder */}
          <div className="flex-1">
            <div className="w-full h-[280px] bg-[#18181B] border border-[#27272A] rounded-xl flex items-center justify-center">
              <button className="w-16 h-16 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center hover:bg-[#3F3F46] transition-colors">
                <Play className="w-7 h-7 text-[#C4F82A] ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Features, How It Works, Requirements */}
        <div className="grid grid-cols-3 gap-8">
          {/* Features */}
          <div>
            <h3 className="font-grotesk text-[16px] font-bold text-white mb-4">Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <FeatureCard
                icon={Cpu}
                title="Multi-Protocol"
                description="Simulate BACnet, Modbus, and LON devices in a single virtual network."
              />
              <FeatureCard
                icon={Network}
                title="Network Topology"
                description="Build complex network topologies with routers, gateways, and controllers."
              />
              <FeatureCard
                icon={Layers}
                title="Object Library"
                description="Pre-built object templates for common HVAC equipment and points."
              />
              <FeatureCard
                icon={TestTubes}
                title="Test Automation"
                description="Script automated test sequences to validate control logic and alarms."
              />
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h3 className="font-grotesk text-[16px] font-bold text-white mb-4">How It Works</h3>
            <div className="space-y-5">
              <StepCard
                stepNumber={1}
                title="Create Virtual Devices"
                description="Select device types and configure object properties from the library or create custom devices."
              />
              <StepCard
                stepNumber={2}
                title="Build Your Network"
                description="Connect devices in a virtual network topology and configure routing and addressing."
              />
              <StepCard
                stepNumber={3}
                title="Test & Validate"
                description="Run your control sequences, generate trends, and validate alarm configurations."
              />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-grotesk text-[16px] font-bold text-white mb-4">Requirements</h3>
            <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-[#27272A]">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#71717A]">Platform</td>
                    <td className="px-4 py-3 font-manrope text-[13px] text-[#A1A1AA]">Windows, macOS, Linux</td>
                  </tr>
                  <tr className="border-b border-[#27272A]">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#71717A]">RAM</td>
                    <td className="px-4 py-3 font-manrope text-[13px] text-[#A1A1AA]">4 GB minimum</td>
                  </tr>
                  <tr className="border-b border-[#27272A]">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#71717A]">Storage</td>
                    <td className="px-4 py-3 font-manrope text-[13px] text-[#A1A1AA]">500 MB free space</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#71717A]">Network</td>
                    <td className="px-4 py-3 font-manrope text-[13px] text-[#A1A1AA]">Ethernet or Wi-Fi</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="px-[80px] py-4">
        <div className="w-full h-px bg-[#27272A]" />
      </div>

      {/* QR Sidekick Section */}
      <section className="py-12 px-[80px]">
        <div className="flex gap-12 items-start mb-12">
          {/* Left Column */}
          <div className="w-[500px] shrink-0">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[#27272A] flex items-center justify-center">
                <span className="font-mono text-[14px] font-bold text-[#C4F82A]">QSK</span>
              </div>
            </div>
            <h2 className="font-grotesk text-[28px] font-bold text-white mb-2">
              QR Sidekick
            </h2>
            <p className="font-manrope text-[16px] text-[#A1A1AA] mb-4">
              QR Code Equipment Manager
            </p>
            <p className="font-manrope text-[14px] text-[#A1A1AA] leading-relaxed mb-6">
              Generate and manage QR codes for BAS equipment in the field. Scan any labeled device to
              instantly access its documentation, maintenance history, point mappings, and commissioning status.
              Works offline and syncs when connected. Available on iOS and Android.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#FA541C]/10 border border-[#FA541C]/30">
                <span className="font-mono text-[11px] font-bold text-[#FA541C] tracking-[1px]">
                  COMING SOON
                </span>
              </span>
              <button className="h-10 px-5 bg-[#18181B] border border-[#3F3F46] text-white font-manrope text-[13px] font-semibold rounded-lg flex items-center gap-2 hover:border-[#52525B] transition-colors">
                App Store
              </button>
              <button className="h-10 px-5 bg-[#18181B] border border-[#3F3F46] text-white font-manrope text-[13px] font-semibold rounded-lg flex items-center gap-2 hover:border-[#52525B] transition-colors">
                Google Play
              </button>
            </div>
          </div>

          {/* Right Column - Demo Placeholder */}
          <div className="flex-1">
            <div className="w-full h-[280px] bg-[#18181B] border border-[#27272A] rounded-xl flex items-center justify-center">
              <button className="w-16 h-16 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center hover:bg-[#3F3F46] transition-colors">
                <Play className="w-7 h-7 text-[#C4F82A] ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Features, How It Works, Requirements */}
        <div className="grid grid-cols-3 gap-8">
          {/* Features */}
          <div>
            <h3 className="font-grotesk text-[16px] font-bold text-white mb-4">Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <FeatureCard
                icon={QrCode}
                title="QR Generation"
                description="Generate branded QR codes for any BAS device, panel, or equipment."
              />
              <FeatureCard
                icon={Smartphone}
                title="Mobile Scanning"
                description="Scan codes instantly with your phone camera for quick field access."
              />
              <FeatureCard
                icon={Database}
                title="Equipment Database"
                description="Store documentation, manuals, and maintenance logs for each device."
              />
              <FeatureCard
                icon={CloudDownload}
                title="Offline Mode"
                description="Access device data offline and sync automatically when reconnected."
              />
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h3 className="font-grotesk text-[16px] font-bold text-white mb-4">How It Works</h3>
            <div className="space-y-5">
              <StepCard
                stepNumber={1}
                title="Label Your Equipment"
                description="Generate QR codes and print weather-resistant labels for your BAS devices and panels."
              />
              <StepCard
                stepNumber={2}
                title="Link Documentation"
                description="Attach drawings, manuals, point lists, and maintenance records to each QR code."
              />
              <StepCard
                stepNumber={3}
                title="Scan in the Field"
                description="Point your phone at any labeled device to access all its information instantly."
              />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-grotesk text-[16px] font-bold text-white mb-4">Requirements</h3>
            <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-[#27272A]">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#71717A]">iOS</td>
                    <td className="px-4 py-3 font-manrope text-[13px] text-[#A1A1AA]">iOS 15.0 or later</td>
                  </tr>
                  <tr className="border-b border-[#27272A]">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#71717A]">Android</td>
                    <td className="px-4 py-3 font-manrope text-[13px] text-[#A1A1AA]">Android 10.0 or later</td>
                  </tr>
                  <tr className="border-b border-[#27272A]">
                    <td className="px-4 py-3 font-mono text-[12px] text-[#71717A]">Camera</td>
                    <td className="px-4 py-3 font-manrope text-[13px] text-[#A1A1AA]">Auto-focus required</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#71717A]">Storage</td>
                    <td className="px-4 py-3 font-manrope text-[13px] text-[#A1A1AA]">100 MB free space</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MessengerWidget />
    </div>
  );
}

export default ToolsPage;
