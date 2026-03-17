import fs from "node:fs";

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getArg(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : "";
}

const version = (getArg("--version") || process.env.RELEASE_VERSION || "").trim();
if (!version) {
    console.error("릴리즈 노트를 만들 version 값이 없습니다. --version <x.y.z> 형식으로 전달하세요.");
    process.exit(1);
}

const readme = fs.readFileSync("README.md", "utf8");
const headingPattern = new RegExp(`^###\\s+v${escapeRegex(version)}\\b[^\\n]*$`, "m");
const headingMatch = readme.match(headingPattern);

if (!headingMatch || headingMatch.index == null) {
    console.error(`README.md에서 v${version} 섹션을 찾지 못했습니다.`);
    process.exit(1);
}

const sectionStart = headingMatch.index + headingMatch[0].length;
const sectionRemainder = readme.slice(sectionStart).replace(/^\r?\n/, "");
const nextHeadingIndex = sectionRemainder.search(/^###\s+/m);
const sectionBody =
    nextHeadingIndex >= 0
        ? sectionRemainder.slice(0, nextHeadingIndex).trim()
        : sectionRemainder.trim();

if (!sectionBody) {
    console.error(`README.md의 v${version} 섹션 내용이 비어 있습니다.`);
    process.exit(1);
}

const title = headingMatch[0].replace(/^###\s+/, "## ");
process.stdout.write(`${title}\n\n${sectionBody}\n`);
