'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

interface VantaEffect {
  destroy: () => void;
  resize: () => void;
}

interface VantaBackdropProps {
  className?: string;
}

// Animated 3D cloudscape via Vanta.js (WebGL). Renders client-side only.
// Colours match the Skyline brand palette so the deep navy of the form
// pages reads as "high altitude sky" with sky-blue sun glare.
export function VantaBackdrop({ className }: VantaBackdropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaEffect | null>(null);

  useEffect(() => {
    if (!containerRef.current || effectRef.current) return;
    let cancelled = false;

    (async () => {
      const THREE = await import('three');
      const CLOUDS = (await import('vanta/dist/vanta.clouds.min')).default;
      if (cancelled || !containerRef.current) return;

      effectRef.current = CLOUDS({
        el: containerRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        // Brand palette → cinematic dusk sky
        backgroundColor: 0x071e3d, // navy
        skyColor: 0x0a2a55, // slightly lighter navy
        cloudColor: 0x4d658e, // navy-300, used for the cloud bodies
        cloudShadowColor: 0x040e1e, // navy-800 for shaded undersides
        sunColor: 0x009fe3, // sky brand colour
        sunGlareColor: 0x009fe3,
        sunlightColor: 0xeaf7fd, // soft brand cloud-white highlight
        speed: 0.9,
      });
    })();

    const handleResize = () => effectRef.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0', className)}
      aria-hidden
    />
  );
}
