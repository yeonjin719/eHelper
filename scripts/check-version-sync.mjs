import fs from "node:fs";

function readJson(path) {
    return JSON.parse(fs.readFileSync(path, "utf8"));
}

function getArg(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : "";
}

const manifest = readJson("manifest.json");
const pkg = readJson("package.json");

const manifestVersion = String(manifest.version || "").trim();
const packageVersion = String(pkg.version || "").trim();

if (!manifestVersion || !packageVersion) {
    console.error("manifest.json 또는 package.json에 version 값이 없습니다.");
    process.exit(1);
}

if (manifestVersion !== packageVersion) {
    console.error(
        `버전이 일치하지 않습니다. manifest=${manifestVersion}, package=${packageVersion}`
    );
    process.exit(1);
}

const tag = getArg("--tag") || process.env.RELEASE_TAG || "";
if (tag && tag !== `v${manifestVersion}`) {
    console.error(`태그(${tag})와 버전(v${manifestVersion})이 일치하지 않습니다.`);
    process.exit(1);
}

console.log(`버전 확인 완료: v${manifestVersion}`);
