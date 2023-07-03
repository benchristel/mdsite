const Logger = {
  warn,
};

function warn(...args: Array<unknown>) {
  console.warn(...args);
}

type MockLoggerCalls = {
  warnings: unknown[];
};

export function mockLogger(duringFn: () => unknown): MockLoggerCalls {
  const originalWarn = Logger.warn;
  const warnings: unknown[] = [];
  Logger.warn = (...args: unknown[]) => warnings.push(args);
  try {
    duringFn();
  } finally {
    Logger.warn = originalWarn;
  }
  return { warnings };
}

export default Logger;
