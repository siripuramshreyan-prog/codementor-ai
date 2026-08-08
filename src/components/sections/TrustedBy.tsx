import { trustedLogos } from '../../data/content';
import { Marquee } from '../ui/Marquee';

export function TrustedBy() {
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-10">
      <Marquee>
        {trustedLogos.map((logo) => (
          <span key={logo} className="mx-2 whitespace-nowrap text-lg font-semibold tracking-tight text-slate-600">
            {logo}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
