import { customAlphabet } from "nanoid";

const slugAlphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const tokenAlphabet = `${slugAlphabet}_-`;
const slugNanoid = customAlphabet(slugAlphabet, 8);
const tokenNanoid = customAlphabet(tokenAlphabet, 32);

export function makeSlug(): string {
  return slugNanoid();
}

export function makeEditToken(): string {
  return `popca_${tokenNanoid()}`;
}

export function isSlug(value: string): boolean {
  return /^[0-9A-Za-z]{8}$/.test(value);
}
