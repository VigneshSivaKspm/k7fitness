param()

Add-Type -AssemblyName System.Drawing

$root = "E:\Legendary One\K7_Fitness"
$webIcons = Join-Path $root "website\public\icons"
$appIcons = Join-Path $root "app\public\icons"
$webPublic = Join-Path $root "website\public"
$appPublic = Join-Path $root "app\public"
$androidRes = Join-Path $root "app\android\app\src\main\res"

Write-Host "Syncing brand assets across website and app..."

# 1. Copy root favicon.ico
Copy-Item (Join-Path $webIcons "favicon.ico") (Join-Path $webPublic "favicon.ico") -Force
Copy-Item (Join-Path $appIcons "favicon.ico") (Join-Path $appPublic "favicon.ico") -Force

# 2. Copy brand logo and banner
New-Item -ItemType Directory -Path (Join-Path $webPublic "brand") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $appPublic "brand") -Force | Out-Null

Copy-Item (Join-Path $webIcons "logo.png") (Join-Path $webPublic "brand\logo.png") -Force
Copy-Item (Join-Path $webIcons "banner.png") (Join-Path $webPublic "brand\banner.png") -Force
Copy-Item (Join-Path $webIcons "android-icon-192x192.png") (Join-Path $webPublic "brand\icon-192.png") -Force

Copy-Item (Join-Path $appIcons "logo.png") (Join-Path $appPublic "brand\logo.png") -Force
Copy-Item (Join-Path $appIcons "banner.png") (Join-Path $appPublic "brand\banner.png") -Force
Copy-Item (Join-Path $appIcons "android-icon-192x192.png") (Join-Path $appPublic "brand\icon-192.png") -Force

function Create-Brand512 {
    param([string]$logoPath, [string]$destPath)
    $bmp = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 8, 8, 10))
    $g.FillRectangle($brush, 0, 0, 512, 512)
    $brush.Dispose()

    $logo = [System.Drawing.Image]::FromFile($logoPath)
    $targetH = 430
    $targetW = [int]($targetH * ($logo.Width / $logo.Height))
    $x = [int]((512 - $targetW) / 2)
    $y = [int]((512 - $targetH) / 2)
    $g.DrawImage($logo, $x, $y, $targetW, $targetH)

    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $logo.Dispose()
}

Create-Brand512 (Join-Path $webIcons "logo.png") (Join-Path $webPublic "brand\icon-512.png")
Create-Brand512 (Join-Path $appIcons "logo.png") (Join-Path $appPublic "brand\icon-512.png")
Write-Host "Brand 512x512 icons generated."

# 3. Android Mipmap Icons
$mipmaps = @{
    "mipmap-mdpi" = @{ size = 48; src = "android-icon-48x48.png"; fg = 108 }
    "mipmap-hdpi" = @{ size = 72; src = "android-icon-72x72.png"; fg = 162 }
    "mipmap-xhdpi" = @{ size = 96; src = "android-icon-96x96.png"; fg = 216 }
    "mipmap-xxhdpi" = @{ size = 144; src = "android-icon-144x144.png"; fg = 324 }
    "mipmap-xxxhdpi" = @{ size = 192; src = "android-icon-192x192.png"; fg = 432 }
}

function Create-IconForeground {
    param([string]$logoPath, [string]$destPath, [int]$size)
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $logo = [System.Drawing.Image]::FromFile($logoPath)
    $targetH = [int]($size * 0.65)
    $targetW = [int]($targetH * ($logo.Width / $logo.Height))
    if ($targetW -gt [int]($size * 0.65)) {
        $targetW = [int]($size * 0.65)
        $targetH = [int]($targetW * ($logo.Height / $logo.Width))
    }
    $x = [int](($size - $targetW) / 2)
    $y = [int](($size - $targetH) / 2)
    $g.DrawImage($logo, $x, $y, $targetW, $targetH)

    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $logo.Dispose()
}

foreach ($m in $mipmaps.Keys) {
    $folder = Join-Path $androidRes $m
    if (Test-Path $folder) {
        $srcFile = Join-Path $appIcons $mipmaps[$m].src
        Copy-Item $srcFile (Join-Path $folder "ic_launcher.png") -Force
        Copy-Item $srcFile (Join-Path $folder "ic_launcher_round.png") -Force
        Create-IconForeground (Join-Path $appIcons "logo.png") (Join-Path $folder "ic_launcher_foreground.png") $mipmaps[$m].fg
        Write-Host "Updated $m launcher icons and foreground."
    }
}

# 4. Android Splash screens
function Create-Splash {
    param([string]$imagePath, [string]$destPath, [int]$w, [int]$h, [bool]$isBanner)
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 8, 8, 10))
    $g.FillRectangle($brush, 0, 0, $w, $h)
    $brush.Dispose()

    $srcImg = [System.Drawing.Image]::FromFile($imagePath)
    if ($isBanner) {
        $targetW = [int]($w * 0.75)
        $targetH = [int]($targetW * ($srcImg.Height / $srcImg.Width))
        if ($targetH -gt [int]($h * 0.70)) {
            $targetH = [int]($h * 0.70)
            $targetW = [int]($targetH * ($srcImg.Width / $srcImg.Height))
        }
    } else {
        $targetH = [int]($h * 0.38)
        $targetW = [int]($targetH * ($srcImg.Width / $srcImg.Height))
        if ($targetW -gt [int]($w * 0.65)) {
            $targetW = [int]($w * 0.65)
            $targetH = [int]($targetW * ($srcImg.Height / $srcImg.Width))
        }
    }
    $x = [int](($w - $targetW) / 2)
    $y = [int](($h - $targetH) / 2)
    $g.DrawImage($srcImg, $x, $y, $targetW, $targetH)

    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $srcImg.Dispose()
}

$splashes = @(
    @{ path = "drawable\splash.png"; w = 480; h = 320; isBanner = $true }
    @{ path = "drawable-land-mdpi\splash.png"; w = 480; h = 320; isBanner = $true }
    @{ path = "drawable-land-hdpi\splash.png"; w = 800; h = 480; isBanner = $true }
    @{ path = "drawable-land-xhdpi\splash.png"; w = 1280; h = 720; isBanner = $true }
    @{ path = "drawable-land-xxhdpi\splash.png"; w = 1600; h = 960; isBanner = $true }
    @{ path = "drawable-land-xxxhdpi\splash.png"; w = 1920; h = 1280; isBanner = $true }
    @{ path = "drawable-port-mdpi\splash.png"; w = 320; h = 480; isBanner = $false }
    @{ path = "drawable-port-hdpi\splash.png"; w = 480; h = 800; isBanner = $false }
    @{ path = "drawable-port-xhdpi\splash.png"; w = 720; h = 1280; isBanner = $false }
    @{ path = "drawable-port-xxhdpi\splash.png"; w = 960; h = 1600; isBanner = $false }
    @{ path = "drawable-port-xxxhdpi\splash.png"; w = 1280; h = 1920; isBanner = $false }
)

foreach ($s in $splashes) {
    $targetPath = Join-Path $androidRes $s.path
    $imgToUse = if ($s.isBanner) { Join-Path $appIcons "banner.png" } else { Join-Path $appIcons "logo.png" }
    Create-Splash $imgToUse $targetPath $s.w $s.h $s.isBanner
    Write-Host "Generated splash for $($s.path) ($($s.w)x$($s.h))"
}

Write-Host "Brand asset sync complete!"

