// One-Sentence Absurd Invention Pitch
// Writes one sentence pitching a ridiculous invention that fixes a tiny
// everyday annoyance to /output/entry.txt. The pitch is a fixed string:
// deterministic, no input, no randomness, no clock, no network.
// Runs on Node 22.18+ (grader: 22.23.4).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const ENTRY =
  "A toaster that launches every slice on a tiny parachute, so your toast never lands butter-side down again.";

export const MAX_CHARS = 220;

export function outputPath(): string {
  return process.env.OUTPUT_PATH ?? "/output/entry.txt";
}

export function main(): void {
  const path = outputPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, ENTRY, "utf8");
}

main();
