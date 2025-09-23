// Déclarations TypeScript pour KkiaPay
declare global {
  interface Window {
    kkiapay: {
      open: (params: {
        amount: number;
        key: string;
        email?: string;
        phone?: string;
        data?: string;
      }) => void;
      close: () => void;
    };
  }
}

export {};
