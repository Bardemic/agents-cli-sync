import { t3Provider } from "./t3.js";

export const providers = [t3Provider];

export function resolveProvider(name) {
  const key = name.toLowerCase();
  return providers.find((p) => p.name === key || p.aliases?.includes(key));
}
