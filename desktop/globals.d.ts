export {};
declare global {
  interface Window {
    mayorDesktop?: {
      isDesktop: boolean;
      minimize: () => void;
      toggleMaximize: () => void;
      close: () => void;
      setTheme: (theme: "dark" | "light") => void;
      exportChronicle: (text: string) => Promise<boolean>;
    };
  }
}
