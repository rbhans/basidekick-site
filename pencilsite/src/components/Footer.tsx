import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#18181B] pt-[60px] px-[80px] pb-[40px]">
      <div className="flex justify-between mb-12">
        <div className="max-w-[300px]">
          <div className="font-mono text-[18px] font-bold text-white mb-3">
            [BASidekick]
          </div>
          <p className="font-manrope text-[14px] text-[#A1A1AA] leading-relaxed">
            Tools, community, and knowledge for BAS professionals. Built by engineers, for engineers.
          </p>
        </div>
        <div className="flex gap-24">
          <div>
            <h4 className="font-mono text-[12px] font-bold text-[#71717A] tracking-[2px] uppercase mb-4">
              Tools
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/tools" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  SimulatorSidekick
                </Link>
              </li>
              <li>
                <Link to="/tools" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  QR Sidekick
                </Link>
              </li>
              <li>
                <Link to="/atlas" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  BAS Atlas
                </Link>
              </li>
              <li>
                <Link to="/tools" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  Calculators
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[12px] font-bold text-[#71717A] tracking-[2px] uppercase mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/wiki" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  Wiki
                </Link>
              </li>
              <li>
                <Link to="/atlas" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  BAS Atlas
                </Link>
              </li>
              <li>
                <Link to="/wiki" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/wiki" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  References
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[12px] font-bold text-[#71717A] tracking-[2px] uppercase mb-4">
              Community
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/pointstack" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  PointStack
                </Link>
              </li>
              <li>
                <a href="#" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="mailto:support@basidekick.com" className="font-manrope text-[14px] text-[#A1A1AA] hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[#27272A] pt-6 flex items-center justify-between">
        <p className="font-manrope text-[13px] text-[#52525B]">
          &copy; 2025 BASidekick. All rights reserved.
        </p>
        <p className="font-manrope text-[13px] text-[#52525B]">
          support@basidekick.com
        </p>
      </div>
    </footer>
  );
}

export default Footer;
