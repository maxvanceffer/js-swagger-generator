let trace = false

module.exports = {
  setTrace: (t) => { trace = Boolean(t) },
  log: () => { if (trace) console.log(...arguments) },
  info: () => { if (trace) console.info(...arguments) },
  error: () => { if (trace) console.error(...arguments) },
  warn: () => { if (trace) console.warn(...arguments) },
}
