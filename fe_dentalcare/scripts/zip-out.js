const fs = require("fs");
const path = require("path");
const { ZipArchive } = require("archiver");

const cwd = process.cwd();
const outDir = path.join(cwd, "out");
const standaloneDir = path.join(cwd, ".next", "standalone");
const nextDir = path.join(cwd, ".next");
const zipPath = path.join(cwd, "out.zip");

let targetDir = "";
let sourceLabel = "";

if (fs.existsSync(outDir)) {
  targetDir = outDir;
  sourceLabel = "direktori static export 'out/'";
} else if (fs.existsSync(standaloneDir)) {
  // Standalone Next.js build requires static and public assets
  const standalonePublic = path.join(standaloneDir, "public");
  const standaloneStatic = path.join(standaloneDir, ".next", "static");
  const srcPublic = path.join(cwd, "public");
  const srcStatic = path.join(cwd, ".next", "static");

  try {
    if (fs.existsSync(srcPublic) && !fs.existsSync(standalonePublic)) {
      fs.cpSync(srcPublic, standalonePublic, { recursive: true });
    }
    if (fs.existsSync(srcStatic) && !fs.existsSync(standaloneStatic)) {
      fs.cpSync(srcStatic, standaloneStatic, { recursive: true });
    }
  } catch (err) {
    console.warn("Peringatan saat menyalin aset ke standalone:", err);
  }

  targetDir = standaloneDir;
  sourceLabel = "direktori build 'standalone' (.next/standalone)";
} else if (fs.existsSync(nextDir)) {
  targetDir = nextDir;
  sourceLabel = "direktori build '.next/'";
} else {
  console.error("❌ Berkas build tidak ditemukan! Pastikan 'next build' selesai dengan baik.");
  process.exit(1);
}

function countFiles(dir) {
  let count = 0;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory()) {
      count += countFiles(path.join(dir, item.name));
    } else {
      count++;
    }
  }
  return count;
}

const fileCount = countFiles(targetDir);

if (fs.existsSync(zipPath)) {
  try {
    fs.unlinkSync(zipPath);
  } catch (err) {
    console.warn("Peringatan: Gagal menghapus out.zip lama:", err);
  }
}

console.log(`\n📦 Mengompresi ${sourceLabel} ke 'out.zip'...`);

const output = fs.createWriteStream(zipPath);
const archive = new ZipArchive({
  zlib: { level: 9 },
});

output.on("close", () => {
  const stats = fs.statSync(zipPath);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  const sizeInKB = (stats.size / 1024).toFixed(2);

  console.log("\n" + "=".repeat(62));
  console.log("  🎉 FILE ARSIP OUT.ZIP BERHASIL DIBUAT & DITAMPILKAN");
  console.log("=".repeat(62));
  console.log(`  📁 Nama File    : out.zip`);
  console.log(`  📍 Lokasi       : ${zipPath}`);
  console.log(`  📊 Ukuran       : ${sizeInMB} MB (${sizeInKB} KB / ${stats.size.toLocaleString("id-ID")} bytes)`);
  console.log(`  📄 Sumber       : ${sourceLabel} (${fileCount} files)`);
  console.log(`  🕒 Waktu Selesai: ${new Date().toLocaleString("id-ID")}`);
  console.log("=".repeat(62) + "\n");
});

archive.on("warning", (err) => {
  if (err.code !== "ENOENT") {
    throw err;
  }
});

archive.on("error", (err) => {
  console.error("❌ Terjadi kesalahan saat membuat zip:", err);
  process.exit(1);
});

archive.pipe(output);
archive.directory(targetDir, false);
archive.finalize();
