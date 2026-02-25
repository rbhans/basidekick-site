import { useState } from 'react';
import {
  BookOpen,
  Search,
  Layers,
  ArrowRight,
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Zap,
  Flame,
  Sun,
  Box,
  Settings,
  Radio,
  Activity,
  Clock,
  ToggleLeft,
  AlertTriangle,
  Binary,
  BarChart3,
  Timer,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MessengerWidget from '../components/MessengerWidget';
import Badge from '../components/Badge';

const equipmentCategories = [
  { name: 'Air Handling Units', count: 12, icon: Wind },
  { name: 'VAV Boxes', count: 8, icon: Box },
  { name: 'Chillers', count: 6, icon: Droplets },
  { name: 'Boilers', count: 5, icon: Flame },
  { name: 'Pumps', count: 7, icon: Activity },
  { name: 'Fans', count: 4, icon: Wind },
  { name: 'Heat Exchangers', count: 3, icon: Thermometer },
  { name: 'Cooling Towers', count: 5, icon: Droplets },
  { name: 'RTUs', count: 5, icon: Sun },
];

const pointCategories = [
  { name: 'Temperature', count: 42, icon: Thermometer },
  { name: 'Pressure', count: 28, icon: Gauge },
  { name: 'Flow', count: 22, icon: Droplets },
  { name: 'Humidity', count: 18, icon: Droplets },
  { name: 'Status', count: 35, icon: ToggleLeft },
  { name: 'Command', count: 30, icon: Settings },
  { name: 'Setpoint', count: 25, icon: BarChart3 },
  { name: 'Alarm', count: 20, icon: AlertTriangle },
  { name: 'Energy', count: 15, icon: Zap },
  { name: 'Runtime', count: 12, icon: Timer },
  { name: 'Binary Input', count: 22, icon: Binary },
  { name: 'Binary Output', count: 18, icon: Radio },
  { name: 'Analog Input', count: 25, icon: Activity },
  { name: 'Analog Output', count: 22, icon: Clock },
];

const equipmentCards = [
  {
    name: 'Air Handling Unit (AHU)',
    category: 'HVAC',
    description: 'Central air handling unit with heating, cooling, and ventilation capabilities.',
    points: 24,
  },
  {
    name: 'Variable Air Volume (VAV)',
    category: 'Terminal Units',
    description: 'Variable air volume box with reheat coil for zone temperature control.',
    points: 12,
  },
  {
    name: 'Centrifugal Chiller',
    category: 'Cooling',
    description: 'Water-cooled centrifugal chiller for central plant cooling applications.',
    points: 32,
  },
  {
    name: 'Hot Water Boiler',
    category: 'Heating',
    description: 'Gas-fired hot water boiler for hydronic heating systems.',
    points: 18,
  },
  {
    name: 'Chilled Water Pump',
    category: 'Pumps',
    description: 'Variable speed chilled water pump with VFD control and monitoring.',
    points: 14,
  },
  {
    name: 'Supply Fan',
    category: 'Fans',
    description: 'Variable speed supply fan with VFD for air handling applications.',
    points: 10,
  },
  {
    name: 'Plate Heat Exchanger',
    category: 'Heat Transfer',
    description: 'Plate-and-frame heat exchanger for waterside economizer applications.',
    points: 8,
  },
  {
    name: 'Cooling Tower',
    category: 'Cooling',
    description: 'Open-circuit cooling tower with variable speed fans and basin heater.',
    points: 16,
  },
  {
    name: 'Rooftop Unit (RTU)',
    category: 'HVAC',
    description: 'Packaged rooftop unit with DX cooling and gas heating.',
    points: 20,
  },
  {
    name: 'Fan Coil Unit (FCU)',
    category: 'Terminal Units',
    description: 'Two-pipe or four-pipe fan coil unit for perimeter zone conditioning.',
    points: 8,
  },
  {
    name: 'Condensing Unit',
    category: 'Cooling',
    description: 'Air-cooled condensing unit for split system DX cooling applications.',
    points: 10,
  },
  {
    name: 'Energy Recovery Ventilator',
    category: 'Ventilation',
    description: 'Enthalpy wheel energy recovery unit for outdoor air preconditioning.',
    points: 14,
  },
];

function BASAtlasPage() {
  const [activeTab, setActiveTab] = useState<'points' | 'equipment'>('points');
  const [activeSidebar, setActiveSidebar] = useState('all');

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Atlas Hero */}
      <section className="py-16 px-[80px] text-center">
        <div className="flex justify-center mb-6">
          <Badge label="RESOURCES" icon={BookOpen} />
        </div>
        <h1 className="font-grotesk text-[42px] font-bold text-white mb-4">
          BAS Atlas
        </h1>
        <p className="font-manrope text-[18px] text-[#A1A1AA] max-w-[600px] mx-auto mb-8">
          The unified reference for point definitions, equipment catalogs, and naming conventions.
          Built on Haystack and Brick standards.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/atlas"
            className="h-11 px-6 bg-[#C4F82A] text-[#0A0A0A] font-manrope text-[14px] font-semibold rounded-lg flex items-center gap-2 hover:bg-[#d4ff5a] transition-colors"
          >
            Point Explorer
            <Layers className="w-4 h-4" />
          </Link>
          <Link
            to="/atlas"
            className="h-11 px-6 bg-transparent border border-[#3F3F46] text-white font-manrope text-[14px] font-semibold rounded-lg flex items-center gap-2 hover:border-[#52525B] transition-colors"
          >
            Equipment Catalog
            <Box className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Tab Bar */}
      <div className="flex items-center justify-center gap-2 px-[80px] mb-8">
        <button
          onClick={() => setActiveTab('points')}
          className={`px-6 py-2.5 rounded-lg font-manrope text-[14px] font-semibold transition-colors ${
            activeTab === 'points'
              ? 'bg-[#27272A] text-white'
              : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          Point Definitions
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-6 py-2.5 rounded-lg font-manrope text-[14px] font-semibold transition-colors ${
            activeTab === 'equipment'
              ? 'bg-[#27272A] text-white'
              : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          Equipment Catalog
        </button>
      </div>

      {/* Body Area */}
      <div className="px-[80px] pb-16 flex gap-6">
        {/* Sidebar */}
        <div className="w-[240px] shrink-0">
          <button
            onClick={() => setActiveSidebar('all')}
            className={`w-full text-left px-4 py-2.5 rounded-lg font-manrope text-[14px] font-semibold mb-4 transition-colors ${
              activeSidebar === 'all'
                ? 'bg-[#C4F82A] text-[#0A0A0A]'
                : 'text-[#A1A1AA] hover:bg-[#18181B]'
            }`}
          >
            All Entries
          </button>

          <div className="mb-6">
            <h4 className="font-mono text-[11px] font-bold text-[#52525B] tracking-[2px] uppercase px-4 mb-2">
              EQUIPMENT
            </h4>
            {equipmentCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveSidebar(cat.name)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                    activeSidebar === cat.name
                      ? 'bg-[#18181B] text-white'
                      : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#71717A]" />
                    <span className="font-manrope text-[13px]">{cat.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#52525B]">{cat.count}</span>
                </button>
              );
            })}
          </div>

          <div>
            <h4 className="font-mono text-[11px] font-bold text-[#52525B] tracking-[2px] uppercase px-4 mb-2">
              POINTS
            </h4>
            {pointCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveSidebar(cat.name)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                    activeSidebar === cat.name
                      ? 'bg-[#18181B] text-white'
                      : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#71717A]" />
                    <span className="font-manrope text-[13px]">{cat.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#52525B]">{cat.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search point definitions and equipment..."
                className="w-full h-11 bg-[#18181B] border border-[#27272A] rounded-xl pl-11 pr-4 text-sm text-white placeholder-[#52525B] font-manrope focus:outline-none focus:border-[#3F3F46] transition-colors"
              />
            </div>
          </div>

          <p className="font-manrope text-[13px] text-[#52525B] mb-6">
            314 entries available
          </p>

          {/* Equipment Section Header */}
          <h3 className="font-mono text-[12px] font-bold text-[#71717A] tracking-[2px] uppercase mb-4">
            EQUIPMENT (55)
          </h3>

          {/* Equipment Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {equipmentCards.map((card) => (
              <div
                key={card.name}
                className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 hover:border-[#3F3F46] transition-colors cursor-pointer group h-[184px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] font-bold text-[#C4F82A] tracking-[1px] uppercase">
                    {card.category}
                  </span>
                  <span className="font-mono text-[11px] text-[#52525B]">
                    {card.points} points
                  </span>
                </div>
                <h4 className="font-grotesk text-[15px] font-bold text-white mb-2 group-hover:text-[#C4F82A] transition-colors">
                  {card.name}
                </h4>
                <p className="font-manrope text-[12px] text-[#A1A1AA] leading-relaxed flex-1">
                  {card.description}
                </p>
                <div className="flex items-center gap-1 mt-3">
                  <span className="font-manrope text-[12px] font-semibold text-[#C4F82A]">
                    View Details
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#C4F82A]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <MessengerWidget />
    </div>
  );
}

export default BASAtlasPage;
