import { cn } from '@/lib/utils';
import { Music } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Music className="text-primary size-7" />
      <h1 className="text-2xl font-bold text-primary font-headline">
        Virtuoso<span className="text-accent">Keys</span>
      </h1>
    </div>
  );
}
