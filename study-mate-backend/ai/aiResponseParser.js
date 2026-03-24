export function parseJSONSafe(raw) {
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {}

    const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match) return null;

    try {
        return JSON.parse(match[1].replace(/,\s*([}\]])/g, '$1'));
    } catch {
        return null;
    }
}
