// Tests for the One-Sentence Absurd Invention Pitch entry.
// Run: node test.mjs  (Node 22.18+; uses only the standard library)
import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { ENTRY, MAX_CHARS } from "./main.ts";

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`ok ${passed} - ${name}`);
}

// 1. The pitch is a non-empty string.
check("pitch is a non-empty string", () => {
  assert.equal(typeof ENTRY, "string");
  assert.ok(ENTRY.length > 0);
});

// 2. Gate: 1 to 220 characters (MAX_CHARS from the bounty rules).
check("pitch is within the 1-220 character gate", () => {
  assert.ok(ENTRY.length >= 1 && ENTRY.length <= MAX_CHARS);
  assert.equal(ENTRY.length, 106);
});

// 3. Gate: not only white space.
check("pitch is not only white space", () => {
  assert.ok(ENTRY.trim().length > 0);
  assert.equal(ENTRY.trim(), ENTRY);
});

// 4. Exactly one sentence: a single terminal period, no other sentence ends.
check("pitch is exactly one sentence", () => {
  assert.equal((ENTRY.match(/\./g) ?? []).length, 1);
  assert.ok(!/[!?]/.test(ENTRY));
  assert.ok(ENTRY.endsWith("."));
});

// 5. Single line: no newline or carriage return anywhere.
check("pitch is a single line", () => {
  assert.ok(!/[\r\n]/.test(ENTRY));
});

// 6. Starts with a capital letter.
check("pitch starts with a capital letter", () => {
  assert.ok(/^[A-Z]/.test(ENTRY));
});

// 7. Names the invention: a toaster.
check("pitch names the invention (toaster)", () => {
  assert.ok(ENTRY.includes("toaster"));
});

// 8. Names the silly mechanism: a tiny parachute.
check("pitch names the silly mechanism (tiny parachute)", () => {
  assert.ok(ENTRY.includes("tiny parachute"));
});

// 9. Names the tiny everyday annoyance: toast landing butter-side down.
check("pitch names the annoyance (butter-side down)", () => {
  assert.ok(ENTRY.includes("butter-side down"));
});

// 10. Pure ASCII, so the file is valid UTF-8 with no surprises.
check("pitch is pure ASCII", () => {
  assert.ok(/^[\x20-\x7E]*$/.test(ENTRY));
});

// 11. Running main.ts writes /output/entry.txt with exactly the pitch.
check("run writes entry.txt with exactly the pitch", () => {
  const dir = mkdtempSync(join(tmpdir(), "absurd-pitch-"));
  try {
    const out = join(dir, "out", "entry.txt");
    execFileSync(process.execPath, ["main.ts"], {
      cwd: new URL(".", import.meta.url).pathname,
      env: { ...process.env, OUTPUT_PATH: out },
      stdio: "pipe",
    });
    assert.ok(existsSync(out));
    assert.equal(readFileSync(out, "utf8"), ENTRY);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// 12. Determinism: two runs produce byte-identical output.
check("two runs are byte-identical", () => {
  const hashes = [];
  for (let i = 0; i < 2; i++) {
    const dir = mkdtempSync(join(tmpdir(), "absurd-pitch-"));
    try {
      const out = join(dir, "entry.txt");
      execFileSync(process.execPath, ["main.ts"], {
        cwd: new URL(".", import.meta.url).pathname,
        env: { ...process.env, OUTPUT_PATH: out },
        stdio: "pipe",
      });
      hashes.push(createHash("sha256").update(readFileSync(out)).digest("hex"));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  assert.equal(hashes[0], hashes[1]);
});

// 13. The program creates a missing output directory on its own.
check("run creates a missing output directory", () => {
  const dir = mkdtempSync(join(tmpdir(), "absurd-pitch-"));
  try {
    const out = join(dir, "deep", "nested", "entry.txt");
    execFileSync(process.execPath, ["main.ts"], {
      cwd: new URL(".", import.meta.url).pathname,
      env: { ...process.env, OUTPUT_PATH: out },
      stdio: "pipe",
    });
    assert.ok(existsSync(out));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

console.log(`\n${passed}/13 tests passed`);
