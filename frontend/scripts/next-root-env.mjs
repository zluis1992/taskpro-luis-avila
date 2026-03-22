import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function parseEnvFile(contents) {
  const env = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }
    if (value.endsWith(";")) value = value.slice(0, -1);
    env[key] = value;
  }
  return env;
}

function loadRootEnv() {
  const rootEnvPath = path.resolve(process.cwd(), "..", ".env");
  if (!fs.existsSync(rootEnvPath)) return;
  const parsed = parseEnvFile(fs.readFileSync(rootEnvPath, "utf8"));
  for (const [k, v] of Object.entries(parsed)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

const args = process.argv.slice(2);
const nextBin = path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");

loadRootEnv();

const child = spawn(process.execPath, [nextBin, ...args], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
