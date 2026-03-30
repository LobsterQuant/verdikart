// Generates apple-touch-icon.png (180x180) and og-image.png (1200x630) using sharp
// Run: node scripts/gen-icons.mjs
import { createCanvas } from "canvas";
import { writeFileSync } from "fs";
import { resolve } from "path";

const PUBLIC = resolve(process.cwd(), "public");

// apple-touch-icon 180x180
{
  const size = 180;
  const c = createCanvas(size, size);
  const ctx = c.getContext("2d");

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#1e1b4b");
  bg.addColorStop(1, "#080810");
  ctx.fillStyle = bg;
  ctx.roundRect(0, 0, size, size, 36);
  ctx.fill();

  // V letter
  ctx.fillStyle = "#6366f1";
  ctx.font = "bold 110px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("V", 90, 95);

  writeFileSync(resolve(PUBLIC, "apple-touch-icon.png"), c.toBuffer("image/png"));
  console.log("✓ apple-touch-icon.png");
}
