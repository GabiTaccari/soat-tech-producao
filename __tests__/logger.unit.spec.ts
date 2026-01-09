describe("logger (unit)", () => {
  it("deve criar logger com métodos info/warn/error", () => {
    const { buildLogger } = require("../src/logger");

    const logger = buildLogger();

    expect(logger).toHaveProperty("info");
    expect(logger).toHaveProperty("warn");
    expect(logger).toHaveProperty("error");
    expect(typeof logger.info).toBe("function");
  });
});
