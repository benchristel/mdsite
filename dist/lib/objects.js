export function intoObject(obj, [k, v]) {
    obj[k] = v;
    return obj;
}
export function valuesToStrings(obj) {
    return Object.entries(obj)
        .map(([k, v]) => [k, String(v)])
        .reduce(intoObject, {});
}
export const mapEntries = (obj, fn) => {
    let ret = {};
    for (let k in obj) {
        if (obj.hasOwnProperty(k)) {
            const [newK, v] = fn([k, obj[k]]);
            ret[newK] = v;
        }
    }
    return ret;
};
