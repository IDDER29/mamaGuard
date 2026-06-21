import Link from "next/link";
import {
  Heart,
  Facebook,
  AtSign,
  Mail,
  Phone,
  MapPin,
  Hospital,
  Globe,
  Sparkles,
} from "lucide-react";

const COLUMNS = [
  {
    heading: "Platform",
    links: ["How it Works", "For Clinics", "Impact Stories", "Pricing"],
  },
  {
    heading: "Company",
    links: ["About Us", "Careers", "Privacy Policy", "Terms of Service"],
  },
];

const PARTNERS = [
  { icon: Hospital, label: "MOH", title: "Ministry of Health" },
  { icon: Globe, label: "GHI", title: "Global Health Initiative" },
  { icon: Sparkles, label: "T4G", title: "Tech for Good" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-glow-sm">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Mama<span className="text-primary">Guard</span>
              </span>
            </Link>
            <p className="text-sm mb-6 leading-relaxed max-w-xs">
              Empowering maternal health through voice AI — bridging the gap
              between rural mothers and life-saving care.
            </p>
            <div className="flex gap-3">
              {[Facebook, AtSign].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-primary hover:text-white hover:ring-primary transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-white font-semibold mb-5 text-sm">
                {col.heading}
              </h4>
              <ul className="space-y-3.5 text-sm">
                {col.links.map((l) => (
                  <li key={l}>
                    <a className="hover:text-primary transition-colors" href="#">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm">Contact</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>hello@mamaguard.health</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>+234 (0) 800 MAMA SAFE</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>
                  Lagos Innovation Center,
                  <br />
                  Ikoyi, Lagos
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Partners */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            In partnership with
          </span>
          <div className="flex items-center gap-8">
            {PARTNERS.map(({ icon: Icon, label, title }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
                title={title}
              >
                <div className="h-8 w-8 rounded-full ring-1 ring-current/40 flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} MamaGuard Health. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
