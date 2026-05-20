declare module 'vanta/dist/vanta.clouds.min' {
  interface VantaEffectInstance {
    destroy: () => void;
    setOptions: (opts: Record<string, unknown>) => void;
    resize: () => void;
  }

  interface VantaCloudsOptions {
    el: HTMLElement | null;
    THREE?: unknown;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    backgroundColor?: number;
    skyColor?: number;
    cloudColor?: number;
    cloudShadowColor?: number;
    sunColor?: number;
    sunGlareColor?: number;
    sunlightColor?: number;
    speed?: number;
  }

  const CLOUDS: (opts: VantaCloudsOptions) => VantaEffectInstance;
  export default CLOUDS;
}
