import { readFileSync, readdirSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const readBytes = (path) => readFileSync(new URL(`../${path}`, import.meta.url));
const sourceFiles = (directory) => readdirSync(new URL(`../${directory}`, import.meta.url), { withFileTypes: true })
  .flatMap((entry) => entry.isDirectory()
    ? sourceFiles(`${directory}/${entry.name}`)
    : /\.(ts|tsx)$/.test(entry.name) ? [`${directory}/${entry.name}`] : []);
const failures = [];
const requireCheck = (ok, message) => {
  if (!ok) failures.push(message);
};

const sourceConfig = read("capacitor.config.ts");
const nativeConfig = JSON.parse(read("ios/App/App/capacitor.config.json"));
const infoPlist = read("ios/App/App/Info.plist");
const project = read("ios/App/App.xcodeproj/project.pbxproj");
const fallbackSource = read("native/www/index.html");
const fallbackIos = read("ios/App/App/public/index.html");
const authSource = read("src/lib/auth.ts");
const mobileSetup = read("MOBILE_SETUP.md");

requireCheck(
  nativeConfig.server?.url === "https://hbcuzone-connect.lovable.app",
  "iOS must load the production PlugU URL.",
);
requireCheck(nativeConfig.server?.cleartext === false, "Cleartext traffic must stay disabled.");
requireCheck(
  nativeConfig.server?.errorPath === "index.html",
  "The native offline fallback is missing.",
);
requireCheck(
  nativeConfig.plugins?.SplashScreen?.launchAutoHide === true &&
    nativeConfig.plugins?.SplashScreen?.launchShowDuration <= 1000,
  "The native splash must auto-hide quickly.",
);
requireCheck(
  nativeConfig.plugins?.Keyboard?.resize === "native",
  "The iOS keyboard must resize the web view so auth controls remain reachable.",
);
requireCheck(
  nativeConfig.plugins?.StatusBar?.style === "DARK",
  "Use light status-bar content (Capacitor style DARK) on PlugU's dark background.",
);
requireCheck(
  sourceConfig.includes("launchShowDuration: 350") &&
    sourceConfig.includes('resize: "native"') &&
    sourceConfig.includes('backgroundColor: "#0a0a0a"'),
  "capacitor.config.ts does not match the checked-in iOS release settings.",
);
requireCheck(
  infoPlist.includes("ITSAppUsesNonExemptEncryption") &&
    infoPlist.includes("NSLocationWhenInUseUsageDescription") &&
    infoPlist.includes("NSCameraUsageDescription") &&
    infoPlist.includes("NSPhotoLibraryUsageDescription"),
  "A required iOS privacy/export declaration is missing.",
);
requireCheck(
  project.includes('TARGETED_DEVICE_FAMILY = "1,2";'),
  "The Xcode target must include both iPhone and iPad.",
);
requireCheck(
  infoPlist.includes("CFBundleURLSchemes") && infoPlist.includes("<string>plugu</string>"),
  "The iOS app must register the PlugU auth callback URL scheme.",
);
for (const redirect of [
  "https://hbcuzone-connect.lovable.app/auth",
  "https://hbcuzone-connect.lovable.app/reset-password",
  "plugu://auth",
  "plugu://reset-password",
]) {
  requireCheck(
    authSource.includes(redirect) || mobileSetup.includes(`- \`${redirect}\``),
    `The documented or emitted auth redirect is missing: ${redirect}`,
  );
}
requireCheck(
  infoPlist.includes("UIInterfaceOrientationLandscapeLeft") &&
    infoPlist.includes("UIInterfaceOrientationLandscapeRight"),
  "The iPhone target must support landscape orientation for iPad review and rotation testing.",
);
requireCheck(
  fallbackSource === fallbackIos,
  "The checked-in iOS fallback is out of sync with native/www.",
);
for (const asset of [
  "plugu-campus-intro-poster.jpg",
  "plugu-campus-intro.mp4",
  "plugu-campus-intro.webm",
]) {
  requireCheck(
    readBytes(`native/www/media/${asset}`).equals(readBytes(`ios/App/App/public/media/${asset}`)),
    `The bundled iOS intro asset is missing or stale: ${asset}`,
  );
}

const forbiddenMarketing = /Verified Pro|KingPin Annual|\$19\.99|\$99\.90/i;
for (const path of ["README.md", "MOBILE_SETUP.md", "docs/app-review/APP-STORE-METADATA.md"]) {
  requireCheck(
    !forbiddenMarketing.test(read(path)),
    `${path} contains retired paid-tier marketing.`,
  );
}

for (const path of ["src", "MOBILE_SETUP.md", "README.md"]) {
  const contents = path === "src"
    ? sourceFiles("src").map((file) => read(file)).join("\n")
    : read(path);
  requireCheck(
    !/Verified Pro|KingPin Annual|boosts?\s+for sale|premium placement/i.test(contents),
    `${path} contains retired paid-feature language.`,
  );
}

if (failures.length) {
  console.error("iOS release verification failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const build = project.match(/CURRENT_PROJECT_VERSION = ([^;]+);/)?.[1] ?? "unknown";
const version = project.match(/MARKETING_VERSION = ([^;]+);/)?.[1] ?? "unknown";
console.log(`iOS release verification passed (version ${version}, build ${build}).`);
