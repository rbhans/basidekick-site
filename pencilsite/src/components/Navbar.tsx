import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  const navLinks = [
    { label: 'Tools', path: '/tools' },
    { label: 'PointStack', path: '/pointstack' },
    { label: 'Resources', path: '/atlas' },
    { label: 'Wiki', path: '/wiki' },
  ];

  return (
    <nav className="h-[72px] bg-[#0A0A0A] flex items-center justify-between px-20 border-b border-[#27272A] sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <Link to="/" className="font-grotesk text-[20px] font-bold text-white hover:text-[#C4F82A] transition-colors">
          [BASidekick]
        </Link>
        <div className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-manrope text-[15px] font-semibold transition-colors ${
                location.pathname === link.path
                  ? 'text-white'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-10 bg-[#18181B] border border-[#27272A] rounded-2xl pl-10 pr-4 text-sm text-white placeholder-[#71717A] font-manrope focus:outline-none focus:border-[#3F3F46] transition-colors"
          />
        </div>
        <Link
          to="/"
          className="h-10 px-5 bg-[#C4F82A] text-[#0A0A0A] font-manrope text-sm font-semibold rounded-lg flex items-center hover:bg-[#d4ff5a] transition-colors"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
