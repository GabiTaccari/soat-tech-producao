const { buildProducaoUseCases } = require("../src/usecases/producaoUseCases");

describe("Producao use cases (unit)", () => {
  it("deve construir os use cases sem erro", () => {
    const repo = {};
    const pedidoGateway = {};

    const useCases = buildProducaoUseCases({ repo, pedidoGateway });

    expect(useCases).toBeDefined();
    expect(typeof useCases).toBe("object");
  });
});
