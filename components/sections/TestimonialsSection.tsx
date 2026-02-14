import Image from "next/image";

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-20 bg-slate-900 dark:bg-slate-950 border-y border-slate-700 dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-white">
              Voices from the Field
            </h2>
            <p className="text-primary font-medium">
              Trusted by communities and clinicians alike
            </p>
          </div>
          {/* Decorative Quotes Icon */}
          <span
            className="material-icons-round text-6xl text-primary/10 hidden md:block transform translate-y-4"
            aria-hidden="true"
          >
            format_quote
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Testimonial 1 */}
          <article className="bg-background-dark border border-gray-800 p-8 rounded-xl relative hover:border-primary/30 transition-colors duration-300">
            <div className="flex items-start mb-6">
              <Image
                alt="Dr. Okonkwo, Chief Obstetrician"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 mr-4"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcCsVuZrXZL1N-JPpvpSDQUryeGGKTjA9DMYr04OWPui0SHRRIBQMWJX5KAHr7Z8Z_BlG5LIA799AT3mKFtwAX2b8m3NY-311r2_WDvKJu6a7w694zcgv9JqM8Cl29GjjIBEA2W4aZQuf-cC-dHx5rVHH5o7BYsb-qseDSWydwodF8Pp4x7mHOjiLlELTDu7OW77N2UT7RkPsYZY6TOTJFDN-DOYGN7OIV6s8AM_DdiQ3tSkbbhlWMTy2lPpc46ga2_Ee8x98jCV-A"
                width={64}
                height={64}
              />
              <div>
                <h3 className="font-bold text-lg text-white">Dr. Okonkwo</h3>
                <p className="text-sm text-primary">
                  Chief Obstetrician, Enugu General
                </p>
              </div>
            </div>
            <blockquote className="text-gray-300 text-lg leading-relaxed italic">
              &quot;This tool has saved lives in our remote clinic by
              prioritizing emergencies. We no longer waste time; we know exactly
              who needs help before they even arrive.&quot;
            </blockquote>
          </article>

          {/* Testimonial 2 */}
          <article className="bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 p-8 rounded-xl relative hover:border-primary/30 transition-colors duration-300">
            <div className="flex items-start mb-6">
              <Image
                alt="Sarah M., Expectant Mother"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 mr-4"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsfKgMW7f5D6fRhvSq3qCjjJI23LZtQS12XVL6r2Sqv2sDmYO4sYwwsC1Ur5-8cly8_1XbcvRcRhvKNqBm_oAiE-CFUtSj_7yILyz9GLq5nwUCh1JDb5SmzVwIpdpuxaEFyGVEajoRcCIBtxbpyFJN_OxxXbL-UD4tGFtk6Yld1Vh6DsSMQrhRoPD79-GCssKIdOjWqp-8pqhf65OEMip0S8eqE9hTNXKXMAdMSEDNpF8WbyypBdlWtfdsKp9itFZJNzPjrAvjyrNc"
                width={64}
                height={64}
              />
              <div>
                <h3 className="font-bold text-lg text-white">Sarah M.</h3>
                <p className="text-sm text-primary">Expectant Mother</p>
              </div>
            </div>
            <blockquote className="text-gray-300 text-lg leading-relaxed italic">
              &quot;I feel safer knowing the doctor is just a voice message
              away. Even though I live far from the town, MamaGuard makes me
              feel connected.&quot;
            </blockquote>
          </article>
        </div>
      </div>
    </section>
  );
}
