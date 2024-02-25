export function diff(a, b) {
    const ret = new Set();
    for (const member of a) {
        if (!b.has(member)) {
            ret.add(member);
        }
    }
    return ret;
}
