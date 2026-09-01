import {readFile} from "node:fs/promises";

const outputPath = new URL("../@CMS/info-actions.html", import.meta.url);
const entryPath = new URL("../src/scripts/info-actions.js", import.meta.url);
const activeLocalConfigImport = /^\s*import\s+["']\.\.\/data\/promotion-settings\.js["'];?/m;

let entrySource;
try {
  await readFile(outputPath, "utf8");
  entrySource = await readFile(entryPath, "utf8");
} catch {
  console.error("[production-config] Сначала выполните npm run build.");
  process.exit(1);
}

if (activeLocalConfigImport.test(entrySource)) {
  console.error(
    "[production-config] Локальный конфиг попал в сборку. " +
      "Закомментируйте import promotion-settings.js и повторите npm run build.",
  );
  process.exit(1);
}

console.info("[production-config] Локальный конфиг в сборке не найден.");
