const pino = require("pino");

function buildLogger() {
  const level = process.env.LOG_LEVEL || "info";
  const transport = process.env.NODE_ENV === "test"
    ? undefined
    : { target: "pino-pretty", options: { colorize: true } };

  return pino({ level, transport });
}

module.exports = { buildLogger };
