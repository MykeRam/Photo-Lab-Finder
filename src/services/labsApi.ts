import { labs } from "../data/labs";
import type { PhotoLab } from "../types";

const delay = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

export async function fetchLabs(): Promise<PhotoLab[]> {
  await delay(700);
  return labs;
}
