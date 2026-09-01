/**
 * One file. Every module under src/ (tests and the CLI aside) is transpiled
 * to CommonJS and packed into a registry, and the page around it is written
 * out as "Deckards Orchestrator MKIII.html". No bundler: the registry is
 * forty lines and the loader resolves the same relative ".ts" paths the
 * source uses, so what runs in the browser is what runs in the tests.
 *
 *   node tools/build.ts
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, posix, relative } from "node:path";
import ts from "typescript";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "Deckards Orchestrator MKIII.html");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".ts") && !name.endsWith(".test.ts") && name !== "cli.ts") out.push(p);
  }
  return out;
}

const modules: string[] = [];
for (const file of walk(SRC).sort()) {
  const key = posix.join(...relative(SRC, file).split(/[\\/]/));
  const js = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false },
  }).outputText;
  modules.push(`${JSON.stringify(key)}: function (require, exports) {\n${js}\n}`);
}

const registry = `(function () {
  var defs = {\n${modules.join(",\n")}\n  };
  var cache = {};
  function resolve(from, spec) {
    var parts = (from ? from.split("/").slice(0, -1) : []).concat(spec.split("/"));
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === "." || parts[i] === "") continue;
      if (parts[i] === "..") out.pop(); else out.push(parts[i]);
    }
    return out.join("/");
  }
  function load(key) {
    if (cache[key]) return cache[key].exports;
    var def = defs[key];
    if (!def) throw new Error("no module " + key);
    var mod = { exports: {} };
    cache[key] = mod;
    def(function (spec) { return load(resolve(key, spec)); }, mod.exports);
    return mod.exports;
  }
  globalThis.MKIII = load("index.ts");
})();`;

const page = readFileSync(join(import.meta.dirname, "page.html"), "utf8");
const embedded = JSON.stringify(registry).replace(/</g, "\\u003c");
writeFileSync(OUT, page.replace("/*BUNDLE*/", embedded));
process.stderr.write(`${relative(ROOT, OUT)}: ${modules.length} modules, ${(statSync(OUT).size / 1024).toFixed(0)} KiB\n`);
void dirname;
