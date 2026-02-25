import { useState } from 'react';
import {
  Rss,
  Users,
  Building2,
  Briefcase,
  FolderOpen,
  Mail,
  Bell,
  Heart,
  MessageSquare,
  Share2,
  Search,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MessengerWidget from '../components/MessengerWidget';

const horizontalNavItems = [
  { label: 'Feed', icon: Rss, active: true },
  { label: 'People', icon: Users, active: false },
  { label: 'Companies', icon: Building2, active: false },
  { label: 'Jobs', icon: Briefcase, active: false },
  { label: 'Resources', icon: FolderOpen, active: false },
  { label: 'Messages', icon: Mail, active: false },
  { label: 'Notifications', icon: Bell, active: false },
];

const tabItems = [
  'All',
  'Discussions',
  'Questions',
  'Tips',
  'Projects',
  'Recent',
  'Popular',
  'Unanswered',
];

const posts = [
  {
    id: 1,
    author: 'Marcus Chen',
    badge: 'BAS Engineer',
    avatarColor: '#3B82F6',
    title: 'Best practices for BACnet MSTP trunk sizing in large buildings?',
    body: "I'm working on a 500,000 sq ft campus project with multiple buildings. We're debating between running separate MSTP trunks per floor vs. per building. The spec calls for max 60 devices per trunk but I've seen issues above 40. What are your experiences with trunk sizing and any tips for reliable communication at scale?",
    tags: ['BACnet', 'Networking', 'Best Practices'],
    likes: 24,
    comments: 18,
    shares: 5,
  },
  {
    id: 2,
    author: 'Sarah Williams',
    badge: 'Controls Tech',
    avatarColor: '#8B5CF6',
    title: 'Migrating from Tridium N4 to modern frameworks - lessons learned',
    body: "Just finished migrating a 12-year-old Niagara 4 system to a modern BAS platform. The biggest challenges were undocumented point mappings and legacy protocols. I wrote up a step-by-step process that might help others tackling similar migrations. Key takeaway: always export your complete point database before starting.",
    tags: ['Tridium', 'Migration', 'Tips'],
    likes: 41,
    comments: 27,
    shares: 12,
  },
  {
    id: 3,
    author: 'David Park',
    badge: 'BAS Integrator',
    avatarColor: '#F59E0B',
    title: 'Open source BACnet tools - what are you using in the field?',
    body: "Looking to expand my toolkit beyond the usual vendor-provided software. I've been using BACnet4J for some scripting work and recently discovered some Rust-based BACnet tools. Would love to hear what open source tools others are using for BACnet discovery, point scanning, trending, and network diagnostics.",
    tags: ['Open Source', 'BACnet', 'Tools', 'Discussion'],
    likes: 33,
    comments: 22,
    shares: 8,
  },
];

function PointStackPage() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="px-[80px] py-10">
        {/* Header */}
        <h1 className="font-grotesk text-[42px] font-bold text-white text-center mb-8">
          PointStack
        </h1>

        {/* Horizontal Nav */}
        <div className="flex items-center justify-center gap-1 mb-8 border-b border-[#27272A] pb-4">
          {horizontalNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-manrope text-[14px] font-semibold transition-colors ${
                  item.active
                    ? 'text-[#C4F82A] bg-[#C4F82A]/10'
                    : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#18181B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Compose Box */}
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#27272A] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#71717A]" />
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Share something with the community..."
                className="w-full bg-transparent text-[15px] text-white placeholder-[#52525B] font-manrope resize-none focus:outline-none h-12 pt-2"
              />
              <div className="flex items-center gap-2 mt-2">
                <button className="px-3 py-1 rounded-full border border-[#27272A] text-[12px] font-manrope text-[#71717A] hover:border-[#3F3F46] hover:text-[#A1A1AA] transition-colors">
                  Discussion
                </button>
                <button className="px-3 py-1 rounded-full border border-[#27272A] text-[12px] font-manrope text-[#71717A] hover:border-[#3F3F46] hover:text-[#A1A1AA] transition-colors">
                  Question
                </button>
                <button className="px-3 py-1 rounded-full border border-[#27272A] text-[12px] font-manrope text-[#71717A] hover:border-[#3F3F46] hover:text-[#A1A1AA] transition-colors">
                  Tip
                </button>
                <button className="px-3 py-1 rounded-full border border-[#27272A] text-[12px] font-manrope text-[#71717A] hover:border-[#3F3F46] hover:text-[#A1A1AA] transition-colors">
                  Project
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search posts by title, content, or tag..."
            className="w-full h-11 bg-[#18181B] border border-[#27272A] rounded-xl pl-11 pr-4 text-sm text-white placeholder-[#52525B] font-manrope focus:outline-none focus:border-[#3F3F46] transition-colors"
          />
        </div>

        {/* Tab Row */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {tabItems.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-manrope text-[13px] font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-[#C4F82A] text-[#0A0A0A]'
                  : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#18181B]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#18181B] border border-[#27272A] rounded-xl p-6 hover:border-[#3F3F46] transition-colors"
            >
              {/* Author Row */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-grotesk text-[14px] font-bold"
                  style={{ backgroundColor: post.avatarColor }}
                >
                  {post.author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-manrope text-[14px] font-semibold text-white">
                      {post.author}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#27272A] text-[11px] font-mono text-[#A1A1AA]">
                      {post.badge}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-grotesk text-[16px] font-bold text-white mb-2">
                {post.title}
              </h3>

              {/* Body */}
              <p className="font-manrope text-[14px] text-[#71717A] leading-relaxed mb-4">
                {post.body}
              </p>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full border border-[#27272A] text-[11px] font-mono text-[#A1A1AA] hover:border-[#3F3F46] transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Engagement */}
              <div className="flex items-center gap-6 pt-3 border-t border-[#27272A]">
                <button className="flex items-center gap-2 text-[#71717A] hover:text-[#C4F82A] transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="font-manrope text-[13px]">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-[#71717A] hover:text-[#C4F82A] transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-manrope text-[13px]">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-[#71717A] hover:text-[#C4F82A] transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="font-manrope text-[13px]">{post.shares}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
      <MessengerWidget />
    </div>
  );
}

export default PointStackPage;
