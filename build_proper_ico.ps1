Add-Type -AssemblyName System.Drawing

function Generate-IconBitmap([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = $size / 256.0

    # Soft ambient drop shadow under squircle
    for ($i = 5; $i -ge 1; $i--) {
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
        [System.Drawing.Color]::FromArgb(255, 120, 150, 255),
        [System.Drawing.Color]::FromArgb(255, 152, 116, 250),
        [System.Drawing.Color]::FromArgb(255, 230, 84, 142),
        [System.Drawing.Color]::FromArgb(255, 252, 98, 92),
        [System.Drawing.Color]::FromArgb(255, 255, 166, 76)
    )
    $lgb.InterpolationColors = $cb
    $g.FillPath($lgb, $rectPath)

    # White hollow star
    $starPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $starPath.StartFigure()
    $starPath.AddBezier((128.0 * $scale), (58.0 * $scale), (128.0 * $scale), (88.0 * $scale), (139.0 * $scale), (112.0 * $scale), (145.0 * $scale), (114.0 * $scale))
    $starPath.AddBezier((145.0 * $scale), (114.0 * $scale), (153.0 * $scale), (116.0 * $scale), (167.0 * $scale), (126.0 * $scale), (178.0 * $scale), (126.0 * $scale))
    $starPath.AddBezier((178.0 * $scale), (126.0 * $scale), (167.0 * $scale), (126.0 * $scale), (153.0 * $scale), (136.0 * $scale), (145.0 * $scale), (138.0 * $scale))
    $starPath.AddBezier((145.0 * $scale), (138.0 * $scale), (139.0 * $scale), (140.0 * $scale), (128.0 * $scale), (164.0 * $scale), (128.0 * $scale), (194.0 * $scale))
    $starPath.AddBezier((128.0 * $scale), (194.0 * $scale), (128.0 * $scale), (164.0 * $scale), (117.0 * $scale), (140.0 * $scale), (111.0 * $scale), (138.0 * $scale))
    $starPath.AddBezier((111.0 * $scale), (138.0 * $scale), (103.0 * $scale), (136.0 * $scale), (89.0 * $scale), (126.0 * $scale), (78.0 * $scale), (126.0 * $scale))
    $starPath.AddBezier((78.0 * $scale), (126.0 * $scale), (89.0 * $scale), (126.0 * $scale), (103.0 * $scale), (116.0 * $scale), (111.0 * $scale), (114.0 * $scale))
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

function ConvertTo-DibBytes([System.Drawing.Bitmap]$bmp) {
    $w = $bmp.Width
    $h = $bmp.Height
    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter $ms

    # BITMAPINFOHEADER (40 bytes)
    $bw.Write([UInt32]40)              # biSize
    $bw.Write([Int32]$w)               # biWidth
    $bw.Write([Int32]($h * 2))         # biHeight (doubled for XOR + AND)
    $bw.Write([UInt16]1)               # biPlanes
    $bw.Write([UInt16]32)              # biBitCount (32-bit ARGB)
    $bw.Write([UInt32]0)               # biCompression (BI_RGB)
    $bw.Write([UInt32]($w * $h * 4))   # biSizeImage
    $bw.Write([Int32]0)                # biXPelsPerMeter
    $bw.Write([Int32]0)                # biYPelsPerMeter
    $bw.Write([UInt32]0)               # biClrUsed
    $bw.Write([UInt32]0)               # biClrImportant

    # Pixel data (BGRA, bottom-up order)
    for ($y = $h - 1; $y -ge 0; $y--) {
        for ($x = 0; $x -lt $w; $x++) {
            $pixel = $bmp.GetPixel($x, $y)
            $bw.Write([byte]$pixel.B)
            $bw.Write([byte]$pixel.G)
            $bw.Write([byte]$pixel.R)
            $bw.Write([byte]$pixel.A)
        }
    }

    # AND mask (1 bit per pixel, row padded to 32 bits / 4 bytes)
    $rowBytes = [int]([Math]::Ceiling($w / 32.0) * 4)
    $andMask = New-Object byte[] ($rowBytes * $h)
    $bw.Write($andMask, 0, $andMask.Length)

    $bw.Flush()
    $bytes = $ms.ToArray()
    $bw.Dispose()
    $ms.Dispose()
    return $bytes
}

# Resolutions: 16, 32, 48, 64, 256
$resolutions = @(16, 32, 48, 64, 256)
$imageEntries = @()

foreach ($res in $resolutions) {
    $bmp = Generate-IconBitmap $res

    if ($res -eq 256) {
        $bmp.Save((Join-Path $PSScriptRoot "okay_dental.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save((Join-Path $PSScriptRoot "START_DENTALCARE.png"), [System.Drawing.Imaging.ImageFormat]::Png)

        # 256x256 as PNG in ICO
        $pms = New-Object System.IO.MemoryStream
        $bmp.Save($pms, [System.Drawing.Imaging.ImageFormat]::Png)
        $bytes = $pms.ToArray()
        $pms.Dispose()
        $imageEntries += @{ Width = 0; Height = 0; Bytes = $bytes }
    } else {
        # 16, 32, 48, 64 as native DIB
        $bytes = ConvertTo-DibBytes $bmp
        $imageEntries += @{ Width = $res; Height = $res; Bytes = $bytes }
    }

    $bmp.Dispose()
}

# Write multi-resolution .ico
function Save-IcoFile([string]$path, $entries) {
    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter $ms

    # ICONDIR
    $bw.Write([UInt16]0)               # Reserved
    $bw.Write([UInt16]1)               # Type: 1 = Icon
    $bw.Write([UInt16]$entries.Count)  # Image count

    $offset = 6 + (16 * $entries.Count)

    foreach ($e in $entries) {
        $bw.Write([byte]$e.Width)
        $bw.Write([byte]$e.Height)
        $bw.Write([byte]0)             # Color count
        $bw.Write([byte]0)             # Reserved
        $bw.Write([UInt16]1)           # Planes
        $bw.Write([UInt16]32)          # BitCount
        $bw.Write([UInt32]$e.Bytes.Length)
        $bw.Write([UInt32]$offset)
        $offset += $e.Bytes.Length
    }

    foreach ($e in $entries) {
        $bArray = [byte[]]$e.Bytes
        $bw.Write($bArray, 0, $bArray.Length)
    }

    $bw.Flush()
    [System.IO.File]::WriteAllBytes($path, $ms.ToArray())
    $bw.Dispose()
    $ms.Dispose()
}

# Write to both okay_dental.ico and START_DENTALCARE.ico
Save-IcoFile (Join-Path $PSScriptRoot "okay_dental.ico") $imageEntries
Save-IcoFile (Join-Path $PSScriptRoot "START_DENTALCARE.ico") $imageEntries

Write-Host "Icons generated successfully with DIB and PNG formats!"
