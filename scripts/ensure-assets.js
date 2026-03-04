#!/usr/bin/env node
/**
 * Ensures required Expo asset files exist. Writes a minimal 1x1 PNG placeholder if missing.
 * Run: node scripts/ensure-assets.js
 */
const fs = require("fs");
const path = require("path");

// Minimal valid 1x1 transparent PNG (67 bytes)
const MINIMAL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const ROOT = path.join(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "assets", "images");
const FILES = [
  "icon.png",
  "adaptive-icon.png",
  "splash-icon.png",
  "favicon.png",
];

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

for (const file of FILES) {
  const filePath = path.join(ASSETS_DIR, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, MINIMAL_PNG);
    console.log("Created:", filePath);
  }
}
console.log("Assets OK.");
