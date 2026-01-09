/* eslint-disable @typescript-eslint/no-var-requires */

function loadBuilder(modulePath: string, exportNames: string[]) {
  const mod = require(modulePath);
  if (typeof mod === "function") return mod;
  for (const n of exportNames) {
    if (mod && typeof mod[n] === "function") return mod[n];
  }
  throw new Error(
    `Builder não encontrado em ${modulePath}. Exports: ${
      mod ? Object.keys(mod).join(", ") : "none"
    }`
  );
}

describe("producaoUseCases (unit) - extra", () => {
  it("iniciar deve falhar sem pedidoId", async () => {
    const repo = {
      upsertByPedidoId: jest.fn(),
      list: jest.fn(),
    };

    const pedidoGateway = {
      atualizarStatus: jest.fn(),
      listarPagos: jest.fn(),
    };

    const buildProducaoUseCases = loadBuilder("../src/usecases/producaoUseCases", [
      "buildProducaoUseCases",
      "build",
      "factory",
    ]);

    const usecases = buildProducaoUseCases({ repo, pedidoGateway });

    await expect(usecases.iniciar(undefined as any)).rejects.toThrow("pedidoId obrigatório");
    expect(repo.upsertByPedidoId).not.toHaveBeenCalled();
    expect(pedidoGateway.atualizarStatus).not.toHaveBeenCalled();
  });

  it("atualizarStatus deve chamar repo + gateway", async () => {
    const repo = {
      upsertByPedidoId: jest.fn().mockResolvedValue({
        id: "p1",
        pedidoId: "ped-1",
        status: "PRONTO",
      }),
      list: jest.fn(),
    };

    const pedidoGateway = {
      atualizarStatus: jest.fn().mockResolvedValue({ ok: true }),
      listarPagos: jest.fn(),
    };

    const buildProducaoUseCases = loadBuilder("../src/usecases/producaoUseCases", [
      "buildProducaoUseCases",
      "build",
      "factory",
    ]);

    const usecases = buildProducaoUseCases({ repo, pedidoGateway });

    // routes passa req.body inteiro; usecase provavelmente lê body.status
    const res = await usecases.atualizarStatus("ped-1", { status: "PRONTO" });

    expect(repo.upsertByPedidoId).toHaveBeenCalledWith("ped-1", "PRONTO");
    expect(pedidoGateway.atualizarStatus).toHaveBeenCalledWith("ped-1", "PRONTO");
    expect(res).toEqual({ id: "p1", pedidoId: "ped-1", status: "PRONTO" });
  });

  it("listarFila deve buscar pagos no gateway e cruzar com estados locais do repo", async () => {
    const repo = {
      list: jest.fn().mockResolvedValue([
        { pedidoId: "ped-1", status: "EM_PREPARACAO" },
        { pedidoId: "ped-2", status: "PRONTO" },
      ]),
      upsertByPedidoId: jest.fn(),
    };

    const pedidoGateway = {
      listarPagos: jest.fn().mockResolvedValue([
        { pedidoId: "ped-1" },
        { pedidoId: "ped-2" },
        { pedidoId: "ped-3" }, // não existe local, deve cair no default do usecase
      ]),
      atualizarStatus: jest.fn(),
    };

    const buildProducaoUseCases = loadBuilder("../src/usecases/producaoUseCases", [
      "buildProducaoUseCases",
      "build",
      "factory",
    ]);

    const usecases = buildProducaoUseCases({ repo, pedidoGateway });

    const fila = await usecases.listarFila();

    expect(pedidoGateway.listarPagos).toHaveBeenCalled();
    expect(repo.list).toHaveBeenCalled();

    // Sem assumir o shape inteiro do retorno, só validando que veio um item por pago
    expect(Array.isArray(fila)).toBe(true);
    expect(fila).toHaveLength(3);
  });
});
