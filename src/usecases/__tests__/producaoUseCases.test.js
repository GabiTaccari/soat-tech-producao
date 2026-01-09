const { buildProducaoUseCases } = require("../producaoUseCases");

describe("producao use cases", () => {
  test("listarFila combina pedidos pagos com status local", async () => {
    const repo = { list: async () => [{ pedidoId: "p1", status: "PRONTO" }] };
    const pedidoGateway = { listarPagos: async () => [{ id: "p1", total: 10, status: "PAGO" }, { id: "p2", total: 5, status: "PAGO" }] };
    const uc = buildProducaoUseCases({ repo, pedidoGateway });

    const fila = await uc.listarFila();
    expect(fila).toHaveLength(2);
    expect(fila.find(x => x.pedidoId === "p1").status).toBe("PRONTO");
    expect(fila.find(x => x.pedidoId === "p2").status).toBe("AGUARDANDO");
  });

  test("iniciar atualiza status local e chama pedido-service", async () => {
    const repo = { upsertByPedidoId: async (pedidoId, status) => ({ pedidoId, status }) };
    const pedidoGateway = { atualizarStatus: jest.fn(async () => {}) };
    const uc = buildProducaoUseCases({ repo, pedidoGateway });

    const rec = await uc.iniciar("p1");
    expect(rec.status).toBe("EM_PREPARACAO");
    expect(pedidoGateway.atualizarStatus).toHaveBeenCalledWith("p1", "EM_PREPARACAO");
  });
});
