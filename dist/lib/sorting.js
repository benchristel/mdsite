export function by(...criteria) {
    return (a, b) => {
        for (const criterion of criteria) {
            const aKey = criterion(a);
            const bKey = criterion(b);
            if (aKey > bKey) {
                return 1;
            }
            else if (aKey < bKey) {
                return -1;
            }
        }
        return 0;
    };
}
