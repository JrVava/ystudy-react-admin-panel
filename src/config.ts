export const config = {
  apiUrl: (import.meta.env.VITE_API_URL as string) || "https://api.ystudy.co.uk/api",
  cryptoKey: (import.meta.env.VITE_CRYPTO_SECRET_KEY as string) || "",
  publicDomain: (import.meta.env.VITE_PUBLIC_DOMAIN as string) || "https://y-study.co.uk"
};

export default config;
