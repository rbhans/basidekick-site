import { useState } from 'react';
import {
  BookOpen,
  Search,
  ChevronDown,
  Filter,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MessengerWidget from '../components/MessengerWidget';
import Badge from '../components/Badge';
import ArticleCard from '../components/ArticleCard';

const categories = [
  { name: 'Networking', count: 3 },
  { name: 'Programming', count: 4 },
  { name: 'Standards', count: 2 },
  { name: 'Commissioning', count: 2 },
  { name: 'Cybersecurity', count: 1 },
  { name: 'Troubleshooting', count: 1 },
  { name: 'Best Practices', count: 1 },
];

const popularTags = [
  'BACnet',
  'HVAC',
  'Haystack',
  'Modbus',
  'Networking',
  'Controls',
  'Sequences',
  'Commissioning',
  'Alarms',
  'VFD',
  'VAV',
  'Cybersecurity',
];

const articles = [
  {
    category: 'Networking',
    title: 'Understanding BACnet MS/TP Networks',
    description: 'A comprehensive guide to BACnet MS/TP networking topology, wiring best practices, and troubleshooting common communication issues.',
    readTime: '8 min read',
    accentColor: '#C4F82A',
  },
  {
    category: 'Programming',
    title: 'Sequences of Operation Best Practices',
    description: 'Learn how to write clear, maintainable sequences of operation for HVAC control systems that technicians can actually follow.',
    readTime: '12 min read',
    accentColor: '#3B82F6',
  },
  {
    category: 'Standards',
    title: 'Introduction to Project Haystack',
    description: 'Get started with Project Haystack tagging conventions and understand how they improve BAS data interoperability across platforms.',
    readTime: '6 min read',
    accentColor: '#F59E0B',
  },
  {
    category: 'Commissioning',
    title: 'BAS Commissioning Checklist',
    description: 'A step-by-step commissioning checklist covering network verification, controller checkout, point validation, and system-level testing.',
    readTime: '10 min read',
    accentColor: '#8B5CF6',
  },
  {
    category: 'Cybersecurity',
    title: 'Securing BAS Networks',
    description: 'Essential cybersecurity practices for building automation systems including network segmentation, access control, and monitoring strategies.',
    readTime: '9 min read',
    accentColor: '#EF4444',
  },
  {
    category: 'Networking',
    title: 'BACnet IP to MS/TP Routing',
    description: 'How to properly configure BACnet routers between IP and MS/TP networks including addressing, BBMD setup, and foreign device registration.',
    readTime: '7 min read',
    accentColor: '#C4F82A',
  },
  {
    category: 'Programming',
    title: 'PID Loop Tuning for HVAC',
    description: 'Practical guide to tuning PID loops for common HVAC applications including discharge air temperature, static pressure, and valve control.',
    readTime: '11 min read',
    accentColor: '#3B82F6',
  },
  {
    category: 'Standards',
    title: 'Brick Schema Overview',
    description: 'Understanding Brick Schema for building metadata and how it complements Project Haystack for comprehensive smart building data models.',
    readTime: '8 min read',
    accentColor: '#F59E0B',
  },
  {
    category: 'Troubleshooting',
    title: 'Common BACnet Communication Issues',
    description: 'Diagnosing and resolving the most frequent BACnet communication problems including token passing failures, duplicate addresses, and timeouts.',
    readTime: '9 min read',
    accentColor: '#10B981',
  },
  {
    category: 'Programming',
    title: 'Alarm Management Best Practices',
    description: 'Design effective alarm strategies for BAS including priority levels, routing, suppression, and reducing nuisance alarms.',
    readTime: '10 min read',
    accentColor: '#3B82F6',
  },
  {
    category: 'Commissioning',
    title: 'Functional Performance Testing',
    description: 'Guide to creating and executing functional performance tests for HVAC systems including test procedures, acceptance criteria, and documentation.',
    readTime: '14 min read',
    accentColor: '#8B5CF6',
  },
  {
    category: 'Networking',
    title: 'Modbus RTU vs TCP Comparison',
    description: 'Compare Modbus RTU and Modbus TCP protocols for BAS integration including wiring, configuration, performance, and use cases.',
    readTime: '6 min read',
    accentColor: '#C4F82A',
  },
  {
    category: 'Best Practices',
    title: 'BAS Point Naming Conventions',
    description: 'Establish consistent point naming conventions for your BAS projects based on industry standards and real-world field experience.',
    readTime: '8 min read',
    accentColor: '#F97316',
  },
  {
    category: 'Programming',
    title: 'Scheduling Strategies for BAS',
    description: 'Implement effective scheduling strategies including optimal start/stop, holiday scheduling, override management, and occupancy-based control.',
    readTime: '7 min read',
    accentColor: '#3B82F6',
  },
];

function WikiPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Wiki Hero */}
      <section className="py-16 px-[80px] text-center">
        <div className="flex justify-center mb-6">
          <Badge label="WIKI" icon={BookOpen} />
        </div>
        <h1 className="font-grotesk text-[42px] font-bold text-white mb-4">
          Knowledge Base
        </h1>
        <p className="font-manrope text-[18px] text-[#A1A1AA] max-w-[600px] mx-auto">
          Articles, guides, and references for building automation professionals. Learn from industry experts and community contributors.
        </p>
      </section>

      {/* Body Area */}
      <div className="px-[80px] pb-16 flex gap-6">
        {/* Sidebar */}
        <div className="w-[240px] shrink-0 bg-[#18181B] rounded-xl p-6 self-start">
          <button
            onClick={() => setActiveCategory('all')}
            className={`w-full text-left px-4 py-2.5 rounded-lg font-manrope text-[14px] font-semibold mb-4 transition-colors ${
              activeCategory === 'all'
                ? 'bg-[#C4F82A] text-[#0A0A0A]'
                : 'text-[#A1A1AA] hover:bg-[#27272A]'
            }`}
          >
            All Articles
          </button>

          <div className="mb-6">
            <h4 className="font-mono text-[11px] font-bold text-[#52525B] tracking-[2px] uppercase px-4 mb-3">
              CATEGORIES
            </h4>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === cat.name
                    ? 'bg-[#27272A] text-white'
                    : 'text-[#A1A1AA] hover:bg-[#27272A] hover:text-white'
                }`}
              >
                <span className="font-manrope text-[13px]">{cat.name}</span>
                <span className="font-mono text-[11px] text-[#52525B]">{cat.count}</span>
              </button>
            ))}
          </div>

          <div>
            <h4 className="font-mono text-[11px] font-bold text-[#52525B] tracking-[2px] uppercase px-4 mb-3">
              POPULAR TAGS
            </h4>
            <div className="flex flex-wrap gap-2 px-4">
              {popularTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full border border-[#27272A] text-[11px] font-mono text-[#A1A1AA] hover:border-[#3F3F46] hover:text-white transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search + Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full h-11 bg-[#18181B] border border-[#27272A] rounded-xl pl-11 pr-4 text-sm text-white placeholder-[#52525B] font-manrope focus:outline-none focus:border-[#3F3F46] transition-colors"
              />
            </div>
            <button className="h-11 px-4 bg-[#18181B] border border-[#27272A] rounded-xl flex items-center gap-2 text-[#A1A1AA] hover:border-[#3F3F46] transition-colors">
              <span className="font-manrope text-[13px]">Newest</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="h-11 px-4 bg-[#18181B] border border-[#27272A] rounded-xl flex items-center gap-2 text-[#A1A1AA] hover:border-[#3F3F46] transition-colors">
              <Filter className="w-4 h-4" />
              <span className="font-manrope text-[13px]">Tags</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="h-11 px-5 bg-[#C4F82A] text-[#0A0A0A] font-manrope text-[13px] font-semibold rounded-xl hover:bg-[#d4ff5a] transition-colors">
              Search
            </button>
          </div>

          <p className="font-manrope text-[13px] text-[#52525B] mb-6">
            14 articles available
          </p>

          {/* Articles Section Header */}
          <h3 className="font-mono text-[12px] font-bold text-[#71717A] tracking-[2px] uppercase mb-4">
            ARTICLES (14)
          </h3>

          {/* Articles Grid */}
          <div className="grid grid-cols-2 gap-4">
            {articles.map((article, idx) => (
              <ArticleCard
                key={idx}
                category={article.category}
                title={article.title}
                description={article.description}
                readTime={article.readTime}
                accentColor={article.accentColor}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <MessengerWidget />
    </div>
  );
}

export default WikiPage;
