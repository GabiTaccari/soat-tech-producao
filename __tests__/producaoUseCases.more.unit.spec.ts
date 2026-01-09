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

function pickFn(obj: any, names: string[]) {
  for (const n of names) {
    if (obj && typeof obj[n] === "function") return obj[n].bind(obj);
  }
  throw new Error(
    `Nenhuma função encontrada. Procurei: ${names.join(", ")}. Keys: ${
      obj ? Object.keys(obj).join(", ") : "obj undefined"
    }`
  );
}

describe("producaoUseCases (unit)", () => {
  it("deve criar/atualizar producao e chamar gateway do pedido", async () => {
    const repo = {
      upsertByPedidoId: jest.fn().mockResolvedValue({ id: "p1", pedidoId: "ped-1", status: "EM_PREPARACAO" }),
    };

    const pedidoGateway = {
      atualizarStatus: jest.fn().mockResolvedValue({ ok: true }),
    };

    const buildProducaoUseCases = loadBuilder("../src/usecases/producaoUseCases", [
      "buildProducaoUseCases",
      "build",
      "factory",
    ]);

    const usecases = buildProducaoUseCases({ repo, pedidoGateway });

    // pelo stacktrace, existe usecases.iniciar(pedidoId)
    const iniciar = pickFn(usecases, ["iniciar", "iniciarProducao", "start"]);

    const res = await iniciar("ped-1");

    expect(repo.upsertByPedidoId).toHaveBeenCalledWith("ped-1", "EM_PREPARACAO");
    expect(pedidoGateway.atualizarStatus).toHaveBeenCalledWith("ped-1", "EM_PREPARACAO");
    expect(res).toEqual({ id: "p1", pedidoId: "ped-1", status: "EM_PREPARACAO" });
  });

  it("deve propagar erro do repo", async () => {
    const repo = {
      upsertByPedidoId: jest.fn().mockRejectedValue(new Error("boom")),
    };

    const pedidoGateway = {
      atualizarStatus: jest.fn(),
    };

    const buildProducaoUseCases = loadBuilder("../src/usecases/producaoUseCases", [
      "buildProducaoUseCases",
      "build",
      "factory",
    ]);

    const usecases = buildProducaoUseCases({ repo, pedidoGateway });

    const iniciar = pickFn(usecases, ["iniciar", "iniciarProducao", "start"]);

    await expect(iniciar("ped-1")).rejects.toThrow("boom");
  });
});
