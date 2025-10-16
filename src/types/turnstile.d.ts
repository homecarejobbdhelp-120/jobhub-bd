// Cloudflare Turnstile type definitions
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
      }) => void;
      reset: () => void;
    };
  }
}

export {};
