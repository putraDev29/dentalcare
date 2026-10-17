Add-Type -AssemblyName System.Drawing

function Generate-IconBitmap([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = $size / 256.0

    # Soft ambient drop shadow under the squircle
    for ($i = 6; $i -ge 1; $i--) {
        $sAlpha = [int](14 / $i)
        $sBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($sAlpha, 110, 140, 255))
        $sPath = New-Object System.Drawing.Drawing2D.GraphicsPath
        $sr = (56.0 + $i * 1.2) * $scale
        $sx = (16.0 - $i * 0.8) * $scale
        $sy = (18.0 + $i * 1.5) * $scale
        $sw = (224.0 + $i * 1.6) * $scale
        $sh = (220.0 + $i * 1.6) * $scale
        $sPath.AddArc($sx, $sy, $sr * 2, $sr * 2, 180, 90)
        $sPath.AddArc($sx + $sw - $sr * 2, $sy, $sr * 2, $sr * 2, 270, 90)
        $sPath.AddArc($sx + $sw - $sr * 2, $sy + $sh - $sr * 2, $sr * 2, $sr * 2, 0, 90)
        $sPath.AddArc($sx, $sy + $sh - $sr * 2, $sr * 2, $sr * 2, 90, 90)
        $sPath.CloseFigure()
        $g.FillPath($sBrush, $sPath)
        $sBrush.Dispose()
        $sPath.Dispose()
    }

    # Main squircle background
    $rectPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $r = 58.0 * $scale
    $x = 18.0 * $scale
    $y = 16.0 * $scale
    $w = 220.0 * $scale
    $h = 220.0 * $scale

    $rectPath.AddArc($x, $y, $r * 2, $r * 2, 180, 90)
    $rectPath.AddArc($x + $w - $r * 2, $y, $r * 2, $r * 2, 270, 90)
    $rectPath.AddArc($x + $w - $r * 2, $y + $h - $r * 2, $r * 2, $r * 2, 0, 90)
    $rectPath.AddArc($x, $y + $h - $r * 2, $r * 2, $r * 2, 90, 90)
    $rectPath.CloseFigure()

    # Multi-stop linear gradient: Bottom-Left (Periwinkle Blue) to Top-Right (Sunny Warm Orange)
    $pt1 = New-Object System.Drawing.PointF ($x), ($y + $h)
    $pt2 = New-Object System.Drawing.PointF ($x + $w), ($y)
    $lgb = New-Object System.Drawing.Drawing2D.LinearGradientBrush ($pt1, $pt2, [System.Drawing.Color]::Blue, [System.Drawing.Color]::Orange)
    $cb = New-Object System.Drawing.Drawing2D.ColorBlend 5
    $cb.Positions = [float[]]@(0.0, 0.24, 0.50, 0.76, 1.0)
    $cb.Colors = [System.Drawing.Color[]]@(
        [System.Drawing.Color]::FromArgb(255, 120, 150, 255),  # Periwinkle lavender blue
        [System.Drawing.Color]::FromArgb(255, 152, 116, 250),  # Purple violet
        [System.Drawing.Color]::FromArgb(255, 230, 84, 142),   # Rose magenta
        [System.Drawing.Color]::FromArgb(255, 252, 98, 92),    # Coral red-orange
        [System.Drawing.Color]::FromArgb(255, 255, 166, 76)    # Warm sunny peach orange
    )
    $lgb.InterpolationColors = $cb
    $g.FillPath($lgb, $rectPath)

    # White hollow vertical-elongated star
    $starPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $starPath.StartFigure()
    # Top tip (128, 58) to Upper-Right valley (145, 114)
    $starPath.AddBezier((128.0 * $scale), (58.0 * $scale), (128.0 * $scale), (88.0 * $scale), (139.0 * $scale), (112.0 * $scale), (145.0 * $scale), (114.0 * $scale))
    # Upper-Right valley to Right tip (178, 126)
    $starPath.AddBezier((145.0 * $scale), (114.0 * $scale), (153.0 * $scale), (116.0 * $scale), (167.0 * $scale), (126.0 * $scale), (178.0 * $scale), (126.0 * $scale))
    # Right tip to Lower-Right valley (145, 138)
    $starPath.AddBezier((178.0 * $scale), (126.0 * $scale), (167.0 * $scale), (126.0 * $scale), (153.0 * $scale), (136.0 * $scale), (145.0 * $scale), (138.0 * $scale))
    # Lower-Right valley to Bottom tip (128, 194)
    $starPath.AddBezier((145.0 * $scale), (138.0 * $scale), (139.0 * $scale), (140.0 * $scale), (128.0 * $scale), (164.0 * $scale), (128.0 * $scale), (194.0 * $scale))
    # Bottom tip to Lower-Left valley (111, 138)
    $starPath.AddBezier((128.0 * $scale), (194.0 * $scale), (128.0 * $scale), (164.0 * $scale), (117.0 * $scale), (140.0 * $scale), (111.0 * $scale), (138.0 * $scale))
    # Lower-Left valley to Left tip (78, 126)
    $starPath.AddBezier((111.0 * $scale), (138.0 * $scale), (103.0 * $scale), (136.0 * $scale), (89.0 * $scale), (126.0 * $scale), (78.0 * $scale), (126.0 * $scale))
    # Left tip to Upper-Left valley (111, 114)
    $starPath.AddBezier((78.0 * $scale), (126.0 * $scale), (89.0 * $scale), (126.0 * $scale), (103.0 * $scale), (116.0 * $scale), (111.0 * $scale), (114.0 * $scale))
    # Upper-Left valley to Top tip (128, 58)
    $starPath.AddBezier((111.0 * $scale), (114.0 * $scale), (117.0 * $scale), (112.0 * $scale), (128.0 * $scale), (88.0 * $scale), (128.0 * $scale), (58.0 * $scale))
    $starPath.CloseFigure()

    $penWidth = [Math]::Max(2.0, (14.0 * $scale))
    $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), $penWidth
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawPath($pen, $starPath)

    # Top-Right Plus Sign
    $plusWidth = [Math]::Max(1.5, (12.0 * $scale))
    $plusPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), $plusWidth
    $plusPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $plusPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($plusPen, (167.0 * $scale), (78.0 * $scale), (185.0 * $scale), (78.0 * $scale))
    $g.DrawLine($plusPen, (176.0 * $scale), (69.0 * $scale), (176.0 * $scale), (87.0 * $scale))

    # Bottom-Left Dot
    $dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $dotD = 17.0 * $scale
    $g.FillEllipse($dotBrush, (82.0 * $scale), (163.0 * $scale), $dotD, $dotD)

    $g.Dispose()
    return $bmp
}

# 1. Generate PNGs for each standard icon resolution
$sizes = @(16, 32, 48, 64, 128, 256)
$pngStreams = @{}

foreach ($s in $sizes) {
    $bmp = Generate-IconBitmap $s
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngStreams[$s] = $ms.ToArray()
    if ($s -eq 256) {
        $bmp.Save("C:\project\dental care\okay_dental.png", [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $ms.Dispose()
    $bmp.Dispose()
}

# 2. Package into multi-resolution .ico file
$icoStream = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter $icoStream

# ICONDIR header
$writer.Write([UInt16]0) # Reserved
$writer.Write([UInt16]1) # Type: 1 = Icon
$writer.Write([UInt16]$sizes.Count) # Image Count

$offset = 6 + (16 * $sizes.Count)

foreach ($s in $sizes) {
    $bytes = $pngStreams[$s]
    $wByte = if ($s -eq 256) { [byte]0 } else { [byte]$s }
    $hByte = if ($s -eq 256) { [byte]0 } else { [byte]$s }

    $writer.Write($wByte)        # Width
    $writer.Write($hByte)        # Height
    $writer.Write([byte]0)       # Color count
    $writer.Write([byte]0)       # Reserved
    $writer.Write([UInt16]1)     # Color planes
    $writer.Write([UInt16]32)    # Bits per pixel
    $writer.Write([UInt32]$bytes.Length) # Image size in bytes
    $writer.Write([UInt32]$offset)       # File offset

    $offset += $bytes.Length
}

foreach ($s in $sizes) {
    $bytes = $pngStreams[$s]
    $writer.Write($bytes)
}

$writer.Flush()
[System.IO.File]::WriteAllBytes("C:\project\dental care\okay_dental.ico", $icoStream.ToArray())
$writer.Dispose()
$icoStream.Dispose()

Write-Host "Berhasil memperbarui okay_dental.ico dan okay_dental.png!"
