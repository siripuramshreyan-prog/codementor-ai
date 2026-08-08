import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { AuroraBackground } from '../components/ui/AuroraBackground';
import { FloatingOrb } from '../components/ui/FloatingOrb';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { GradientText } from '../components/ui/GradientText';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <AuroraBackground />
      <FloatingOrb size={100} color="violet" className="left-[12%] top-[18%]" />
      <FloatingOrb size={80} color="cyan" className="right-[14%] bottom-[20%]" delay="-3s" />

      <GlassCard hover={false} className="relative flex max-w-md flex-col items-center p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-violet/10 text-brand-cyan">
          <Compass size={26} />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white">
          4<GradientText>0</GradientText>4
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          This page doesn't exist — it may have been moved or the link might be broken.
        </p>
        <Link to="/" className="mt-8">
          <GlowButton icon={<ArrowLeft size={16} />}>Back to Home</GlowButton>
        </Link>
      </GlassCard>
    </div>
  );
}
