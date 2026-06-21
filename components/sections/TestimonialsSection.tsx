import Image from "next/image";
import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Dr. Okonkwo",
    role: "Chief Obstetrician, Enugu General",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAcCsVuZrXZL1N-JPpvpSDQUryeGGKTjA9DMYr04OWPui0SHRRIBQMWJX5KAHr7Z8Z_BlG5LIA799AT3mKFtwAX2b8m3NY-311r2_WDvKJu6a7w694zcgv9JqM8Cl29GjjIBEA2W4aZQuf-cC-dHx5rVHH5o7BYsb-qseDSWydwodF8Pp4x7mHOjiLlELTDu7OW77N2UT7RkPsYZY6TOTJFDN-DOYGN7OIV6s8AM_DdiQ3tSkbbhlWMTy2lPpc46ga2_Ee8x98jCV-A",
    quote:
      "This tool has saved lives in our remote clinic by prioritizing emergencies. We no longer waste time — we know exactly who needs help before they even arrive.",
  },
  {
    name: "Sarah M.",
    role: "Expectant Mother",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBsfKgMW7f5D6fRhvSq3qCjjJI23LZtQS12XVL6r2Sqv2sDmYO4sYwwsC1Ur5-8cly8_1XbcvRcRhvKNqBm_oAiE-CFUtSj_7yILyz9GLq5nwUCh1JDb5SmzVwIpdpuxaEFyGVEajoRcCIBtxbpyFJN_OxxXbL-UD4tGFtk6Yld1Vh6DsSMQrhRoPD79-GCssKIdOjWqp-8pqhf65OEMip0S8eqE9hTNXKXMAdMSEDNpF8WbyypBdlWtfdsKp9itFZJNzPjrAvjyrNc",
    quote:
      "I feel safer knowing the doctor is just a voice message away. Even though I live far from town, MamaGuard makes me feel connected.",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative py-20 sm:py-28 bg-slate-950 overflow-hidden"
    >
      {/* Glow accents */}
      <div
        className="absolute -top-20 left-1/4 w-[36rem] h-[36rem] bg-primary/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-grid opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-primary font-semibold tracking-wider uppercase text-xs sm:text-sm mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-white text-balance">
            Voices from the field
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 text-pretty">
            Trusted by communities and clinicians alike.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="relative rounded-2xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm p-8 transition-colors duration-300 hover:ring-primary/30"
            >
              <Quote
                className="absolute top-6 right-6 h-10 w-10 text-primary/15"
                aria-hidden="true"
              />
              <div className="flex text-amber-400 mb-5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-lg leading-relaxed text-slate-200">
                “{t.quote}”
              </blockquote>
              <div className="flex items-center gap-4 mt-7 pt-6 border-t border-white/10">
                <Image
                  alt={t.name}
                  src={t.avatar}
                  width={52}
                  height={52}
                  className="w-13 h-13 rounded-full object-cover ring-2 ring-primary/30"
                />
                <div>
                  <h3 className="font-semibold text-white">{t.name}</h3>
                  <p className="text-sm text-primary">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
