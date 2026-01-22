const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get version from environment variable (fallback to current version in package.json)
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = process.env.APP_VERSION || packageJson.version;

// Get short commit SHA
const commitSha = execSync('git rev-parse --short HEAD').toString().trim();

// Update package.json
packageJson.version = version;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`Updated package.json version to ${version}`);

// Update package-lock.json
const packageLockPath = path.join(__dirname, '../package-lock.json');
if (fs.existsSync(packageLockPath)) {
  const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
  packageLock.version = version;
  if (packageLock.packages && packageLock.packages['']) {
    packageLock.packages[''].version = version;
  }
  fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2) + '\n');
  console.log(`Updated package-lock.json version to ${version}`);
}

// Update tauri.conf.json
const tauriConfigPath = path.join(__dirname, '../src-tauri/tauri.conf.json');
const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));
tauriConfig.version = version;
fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + '\n');
console.log(`Updated tauri.conf.json version to ${version}`);

// Update Cargo.toml
const cargoTomlPath = path.join(__dirname, '../src-tauri/Cargo.toml');
let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
cargoToml = cargoToml.replace(/^version = ".*"$/m, `version = "${version}"`);
fs.writeFileSync(cargoTomlPath, cargoToml);
console.log(`Updated Cargo.toml version to ${version}`);

// Update Info.plist with commit SHA
const plistPath = path.join(__dirname, '../src-tauri/Info.plist');
const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleVersion</key>
    <string>${commitSha}</string>
</dict>
</plist>
`;
fs.writeFileSync(plistPath, plistContent);
console.log(`Updated CFBundleVersion to ${commitSha}`);
