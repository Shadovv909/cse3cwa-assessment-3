import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const projectRoot = process.cwd();

async function existingTypeScriptPath(basePath) {
  const candidates = path.extname(basePath)
    ? [basePath]
    : [basePath, `${basePath}.ts`, `${basePath}.tsx`, path.join(basePath, "index.ts"), path.join(basePath, "index.tsx")];
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return candidate;
    } catch {}
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const resolved = await existingTypeScriptPath(
      path.join(projectRoot, "src", specifier.slice(2)),
    );
    if (!resolved) throw new Error(`Unable to resolve ${specifier}`);
    return { url: pathToFileURL(resolved).href, shortCircuit: true };
  }

  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const parentPath = path.dirname(fileURLToPath(context.parentURL));
    const resolved = await existingTypeScriptPath(path.resolve(parentPath, specifier));
    if (resolved) return { url: pathToFileURL(resolved).href, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    const source = await fs.readFile(fileURLToPath(url), "utf8");
    const result = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        jsx: ts.JsxEmit.ReactJSX,
      },
      fileName: fileURLToPath(url),
    });
    return { format: "module", source: result.outputText, shortCircuit: true };
  }
  return nextLoad(url, context);
}
