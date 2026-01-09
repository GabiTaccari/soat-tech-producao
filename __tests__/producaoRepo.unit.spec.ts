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

describe("producaoRepo (unit)", () => {
  it("deve chamar prisma no upsertByPedidoId", async () => {
    const prismaMock = {
      producao: {
        upsert: jest.fn().mockResolvedValue({ id: "p1", pedidoId: "ped-1", status: "EM_PREPARACAO" }),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const buildProducaoRepo = loadBuilder("../src/repo/producaoRepo", [
      "buildProducaoRepo",
      "build",
      "factory",
    ]);

    const repo = buildProducaoRepo({ prisma: prismaMock });

    expect(typeof repo.upsertByPedidoId).toBe("function");

    const out = await repo.upsertByPedidoId("ped-1", "EM_PREPARACAO");

    expect(prismaMock.producao.upsert).toHaveBeenCalled();
    expect(out).toEqual({ id: "p1", pedidoId: "ped-1", status: "EM_PREPARACAO" });
  });
});
