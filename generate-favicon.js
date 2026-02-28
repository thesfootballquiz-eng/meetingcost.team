// generate-favicon.js
// Generates a branded 32x32 favicon.ico for MeetingCost.team
// Background: #064e3b (emerald-900), symbol: #34d399 (emerald-400)

const fs = require("fs");
const path = require("path");

const W = 32, H = 32;

// Colors in BGRA order (BMP format)
const BG  = [0x3b, 0x4e, 0x06, 0xff]; // #064e3b
const FG  = [0x99, 0xd3, 0x34, 0xff]; // #34d399
const TRP = [0x00, 0x00, 0x00, 0x00]; // transparent

// Build the pixel grid (0 = bg, 1 = fg)
// "$" symbol drawn on 32x32 canvas, ~16px wide centered
const grid = Array.from({ length: H }, () => new Array(W).fill(0));

function dot(x, y) {
  if (x >= 0 && x < W && y >= 0 && y < H) grid[y][x] = 1;
}
function hline(y, x1, x2) {
  for (let x = x1; x <= x2; x++) dot(x, y);
}
function vline(x, y1, y2) {
  for (let y = y1; y <= y2; y++) dot(x, y);
}
function fillRect(x1, y1, x2, y2) {
  for (let y = y1; y <= y2; y++) hline(y, x1, x2);
}

// --- Draw a clean "$" centered in 32x32 ---
// Vertical bar (center), runs through entire symbol
vline(15, 3, 28);
vline(16, 3, 28);

// Top arc of S (top half)
hline(5, 10, 21);   // top horizontal bar
hline(6, 9, 21);
vline(9,  7, 10);   // left side
vline(10, 6, 11);
vline(20, 6, 12);   // right side (top)
vline(21, 5, 12);
hline(12, 10, 20);  // middle bar (top half)
hline(13, 9, 21);

// Bottom arc of S
hline(19, 10, 20);  // middle bar (bottom half)
hline(20, 9, 21);
vline(9,  20, 26);  // left side
vline(10, 19, 25);
vline(20, 21, 26);  // right side (bottom)
vline(21, 20, 27);
hline(26, 10, 21);  // bottom horizontal bar
hline(27, 9, 21);

// Build pixel buffer: BMP is stored bottom-to-top
// BITMAPINFOHEADER (40 bytes)
const pixelDataSize = W * H * 4;
const andMaskSize   = H * Math.ceil(W / 32) * 4; // padded to DWORD rows
const bmpSize = 40 + pixelDataSize + andMaskSize;

const bmp = Buffer.alloc(bmpSize, 0);
let offset = 0;

// BITMAPINFOHEADER
bmp.writeUInt32LE(40,             offset);      offset += 4; // biSize
bmp.writeInt32LE (W,              offset);      offset += 4; // biWidth
bmp.writeInt32LE (H * 2,          offset);      offset += 4; // biHeight (x2 for mask)
bmp.writeUInt16LE(1,              offset);      offset += 2; // biPlanes
bmp.writeUInt16LE(32,             offset);      offset += 2; // biBitCount
bmp.writeUInt32LE(0,              offset);      offset += 4; // biCompression
bmp.writeUInt32LE(pixelDataSize,  offset);      offset += 4; // biSizeImage
bmp.writeInt32LE (0,              offset);      offset += 4; // biXPelsPerMeter
bmp.writeInt32LE (0,              offset);      offset += 4; // biYPelsPerMeter
bmp.writeUInt32LE(0,              offset);      offset += 4; // biClrUsed
bmp.writeUInt32LE(0,              offset);      offset += 4; // biClrImportant

// Pixel data (bottom-to-top in BMP)
for (let row = H - 1; row >= 0; row--) {
  for (let col = 0; col < W; col++) {
    const c = grid[row][col] === 1 ? FG : BG;
    bmp[offset++] = c[0]; // B
    bmp[offset++] = c[1]; // G
    bmp[offset++] = c[2]; // R
    bmp[offset++] = c[3]; // A
  }
}

// AND mask (all 0 = fully opaque), already zeroed

// ICO wrapper
// ICONDIR (6 bytes)
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type = ICO
icoHeader.writeUInt16LE(1, 4); // count = 1 image

// ICONDIRENTRY (16 bytes)
const icoDir = Buffer.alloc(16);
icoDir[0] = W;                  // width
icoDir[1] = H;                  // height
icoDir[2] = 0;                  // color count (0 = no palette)
icoDir[3] = 0;                  // reserved
icoDir.writeUInt16LE(1,  4);    // planes
icoDir.writeUInt16LE(32, 6);    // bit count
icoDir.writeUInt32LE(bmpSize, 8); // bytes in resource
icoDir.writeUInt32LE(22, 12);   // offset = 6 (header) + 16 (dir) = 22

const icoFile = Buffer.concat([icoHeader, icoDir, bmp]);

const outPath = path.join(__dirname, "src", "app", "favicon.ico");
fs.writeFileSync(outPath, icoFile);
console.log(`✅ Generated favicon.ico (${icoFile.length} bytes) → ${outPath}`);
