export function cleanText(value: unknown) {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .trim();
}
