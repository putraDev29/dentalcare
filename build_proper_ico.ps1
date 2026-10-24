# ================================================================
#  OKAY DENTAL CLINIC - BUILD PROPER MULTI-RESOLUTION WINDOWS ICO
#  Generates multi-resolution Windows ICO (256, 128, 64, 48, 32, 24, 16)
#  using PNG compression frames (Vista, Win7, 8, 10, 11 compatible)
# ================================================================
Add-Type -AssemblyName System.Drawing

$workingDir = $PSScriptRoot
if (-not $workingDir) {
    $workingDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if (-not $workingDir) {
    $workingDir = (Get-Location).Path
}

$srcPath = Join-Path $workingDir "fe_dentalcare\public\app-icon-dark.png"
if (-not (Test-Path $srcPath)) {
    $srcPath = Join-Path $workingDir "fe_dentalcare\public\logo-icon-square.png"
}

if (-not (Test-Path $srcPath)) {
    Write-Error "Source icon not found at: $srcPath"
    exit 1
}

Write-Host "Source image: $srcPath"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public class NativeIcoBuilder {
    public static void SaveMultiResolutionIco(Bitmap src, string outputPath) {
        int[] sizes = new int[] { 256, 128, 64, 48, 32, 24, 16 };
        byte[][] pngData = new byte[sizes.Length][];

        for (int i = 0; i < sizes.Length; i++) {
            int sz = sizes[i];
            using (var bmp = new Bitmap(sz, sz, PixelFormat.Format32bppArgb)) {
                using (var g = Graphics.FromImage(bmp)) {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;
                    g.Clear(Color.Transparent);
                    g.DrawImage(src, 0, 0, sz, sz);
                }
                using (var ms = new MemoryStream()) {
                    bmp.Save(ms, ImageFormat.Png);
                    pngData[i] = ms.ToArray();
                }
            }
        }

        using (var fs = new FileStream(outputPath, FileMode.Create, FileAccess.Write)) {
            using (var bw = new BinaryWriter(fs)) {
                // ICONDIR Header
                bw.Write((short)0); // Reserved
                bw.Write((short)1); // Type 1 = Icon
                bw.Write((short)sizes.Length); // Image count

                int offset = 6 + (16 * sizes.Length);

                // ICONDIRENTRY entries
                for (int i = 0; i < sizes.Length; i++) {
                    int sz = sizes[i];
                    byte bSz = (byte)(sz >= 256 ? 0 : sz);
                    bw.Write(bSz); // Width
                    bw.Write(bSz); // Height
                    bw.Write((byte)0); // Color count
                    bw.Write((byte)0); // Reserved
                    bw.Write((short)1); // Color planes
                    bw.Write((short)32); // Bits per pixel
                    bw.Write((int)pngData[i].Length); // Size of image data
                    bw.Write((int)offset); // Offset of image data
                    offset += pngData[i].Length;
                }

                // Image Data (PNG streams)
                for (int i = 0; i < sizes.Length; i++) {
                    bw.Write(pngData[i]);
                }
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies System.Drawing

$ico1 = Join-Path $workingDir "START_DENTALCARE.ico"
$ico2 = Join-Path $workingDir "okay_dental.ico"
[NativeIcoBuilder]::SaveMultiResolutionIco($src, $ico1)
[NativeIcoBuilder]::SaveMultiResolutionIco($src, $ico2)

Write-Host "Created $ico1"
Write-Host "Created $ico2"

$src.Dispose()
Write-Host "Multi-resolution Windows ICO build completed successfully!"
