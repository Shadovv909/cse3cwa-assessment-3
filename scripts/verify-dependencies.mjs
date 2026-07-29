import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const requiredPackages = [
  "next",
  "react",
  "react-dom",
  "eslint",
  "eslint-config-next",
  "typescript",
];

const missing = requiredPackages.filter(
  (packageName) =>
    !existsSync(path.join(process.cwd(), "node_modules", packageName, "package.json")),
);

if (missing.length > 0) {
  console.error("\nLocal project dependencies are missing or incomplete.");
  console.error(`Missing: ${missing.join(", ")}`);
  console.error("\nFrom this folder, run:");
  console.error("  npm ci --include=dev");
  console.error("\nThen run npm run check or npm run dev again.");
  console.error("Do not use VS Code Live Server/Go Live for this Next.js project.\n");
  process.exit(1);
}

const versions = Object.fromEntries(
  requiredPackages.map((packageName) => {
    const packagePath = path.join(
      process.cwd(),
      "node_modules",
      packageName,
      "package.json",
    );
    const packageData = JSON.parse(readFileSync(packagePath, "utf8"));
    return [packageName, packageData.version];
  }),
);

console.log(
  `Local dependencies ready: Next ${versions.next}, React ${versions.react}, ESLint ${versions.eslint}.`,
);
