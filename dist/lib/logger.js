const Logger = {
    warn,
};
function warn(...args) {
    console.warn(...args);
}
export function mockLogger(duringFn) {
    const originalWarn = Logger.warn;
    const warnings = [];
    Logger.warn = (...args) => warnings.push(args);
    try {
        duringFn();
    }
    finally {
        Logger.warn = originalWarn;
    }
    return { warnings };
}
export default Logger;
