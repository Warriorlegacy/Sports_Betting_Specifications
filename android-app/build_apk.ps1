$ErrorActionPreference = "Stop"

$BUILD_TOOLS = "C:\Users\Piyush\AppData\Local\Android\Sdk\build-tools\34.0.0"
$PLATFORM = "C:\Users\Piyush\AppData\Local\Android\Sdk\platforms\android-34"
$ANDROID_JAR = "$PLATFORM\android.jar"
$APP_DIR = "d:\Sports_Betting_Specifications\android-app"
$OUT_APK = "d:\Sports_Betting_Specifications\services\player-portal\public\apk\nexusvip-exchange.apk"

Set-Location $APP_DIR

Write-Host "1. Cleaning and creating build directories..."
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
New-Item -ItemType Directory -Force -Path "build\gen", "build\obj", "build\dex" | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $OUT_APK) | Out-Null

Write-Host "2. Compiling resources with aapt2..."
& "$BUILD_TOOLS\aapt2.exe" compile --dir res -o "build\compiled_res.zip"

Write-Host "3. Linking APK package and generating R.java..."
& "$BUILD_TOOLS\aapt2.exe" link -I $ANDROID_JAR `
    --manifest AndroidManifest.xml `
    "build\compiled_res.zip" `
    -o "build\unaligned_res.apk" `
    --java "build\gen" `
    --auto-add-overlay

Write-Host "4. Compiling Java sources with javac..."
$javaFiles = @(Get-ChildItem -Path "src", "build\gen" -Recurse -Filter *.java | ForEach-Object { $_.FullName })
& "javac" -encoding UTF-8 -cp $ANDROID_JAR -d "build\obj" $javaFiles

Write-Host "5. Converting bytecode to DEX with d8..."
$classFiles = @(Get-ChildItem -Path "build\obj" -Recurse -Filter *.class | ForEach-Object { $_.FullName })
& "$BUILD_TOOLS\d8.bat" --output "build\dex" --lib $ANDROID_JAR $classFiles

Write-Host "6. Packaging classes.dex into APK..."
Copy-Item "build\unaligned_res.apk" "build\app_with_dex.apk"
& "jar" -uf "build\app_with_dex.apk" -C "build\dex" classes.dex

Write-Host "7. Aligning APK with zipalign..."
& "$BUILD_TOOLS\zipalign.exe" -p -f 4 "build\app_with_dex.apk" "build\aligned.apk"

Write-Host "8. Generating signing keystore if not present..."
if (-not (Test-Path "debug.keystore")) {
    & "keytool" -genkeypair -v `
        -keystore "debug.keystore" `
        -alias "nexusvip" `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -storepass "nexus123" `
        -keypass "nexus123" `
        -dname "CN=Piyush Raj Singh, OU=Engineering, O=NexusVIP, L=Delhi, ST=DL, C=IN"
}

Write-Host "9. Signing APK with apksigner..."
& "$BUILD_TOOLS\apksigner.bat" sign `
    --ks "debug.keystore" `
    --ks-pass "pass:nexus123" `
    --key-pass "pass:nexus123" `
    --ks-key-alias "nexusvip" `
    --out $OUT_APK `
    "build\aligned.apk"

Write-Host "10. Verifying APK signature..."
& "$BUILD_TOOLS\apksigner.bat" verify -v $OUT_APK

$apkSize = (Get-Item $OUT_APK).Length / 1KB
Write-Host "🎉 SUCCESS! NexusVIP Android APK built successfully at: $OUT_APK ($([math]::Round($apkSize, 2)) KB)"
