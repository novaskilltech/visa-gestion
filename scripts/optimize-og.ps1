Add-Type -AssemblyName System.Drawing

function Optimize-Image {
    param(
        [string]$sourcePath,
        [string]$destPath,
        [int]$targetWidth,
        [int]$targetHeight,
        [long]$quality = 85
    )

    $src = [System.Drawing.Image]::FromFile($sourcePath)
    $dest = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $g = [System.Drawing.Graphics]::FromImage($dest)

    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $g.DrawImage($src, 0, 0, $targetWidth, $targetHeight)

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)

    $src.Dispose()
    $g.Dispose()

    $dest.Save($destPath, $codec, $encoderParams)
    $dest.Dispose()

    $fileInfo = Get-Item $destPath
    Write-Host "Created $destPath - Size: $($fileInfo.Length) bytes ($([math]::Round($fileInfo.Length / 1KB, 1)) KB)"
}

Optimize-Image -sourcePath 'public/og-image.jpg' -destPath 'public/og-image-optimized.jpg' -targetWidth 1200 -targetHeight 630 -quality 82
Optimize-Image -sourcePath 'public/og-image.jpg' -destPath 'public/og-image-square.jpg' -targetWidth 600 -targetHeight 600 -quality 82

# Replace og-image.jpg and twitter-image.jpg with the 1200x630 optimized version
Copy-Item -Path 'public/og-image-optimized.jpg' -Destination 'public/og-image.jpg' -Force
Copy-Item -Path 'public/og-image-optimized.jpg' -Destination 'public/twitter-image.jpg' -Force
Remove-Item -Path 'public/og-image-optimized.jpg' -Force

Write-Host "Done! Optimized og-image.jpg and twitter-image.jpg"
