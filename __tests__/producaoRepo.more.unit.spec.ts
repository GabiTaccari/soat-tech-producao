/* eslint-disable @typescript-eslint/no-var-requires */

function loadBuilder(modulePath: string, exportNames: string[]) {
  const mod = require(modulePath);
  if (typeof mod === "function") return mod;
  for (const n of exportNames) {
    if (mod && typeof mod[n] === "function") return mod[n];
  }
  throw new Error(
    `Builder não encontrado em ${modulePath}. Exports: ${mod ? Object.keys(mod).join(", ") : "none"}`
  );
}

describe("producaoRepo (unit) - extra", () => {
  it("findByPedidoId deve chamar prisma.producao.findUnique", async () => {
    const prismaMock = {
      producao: {
        findUnique: jest.fn().mockResolvedValue({ id: "p1" }),
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const buildProducaoRepo = loadBuilder("../src/repo/producaoRepo", [
      "buildProducaoRepo",
      "build",
      "factory",
    ]);

    const repo = buildProducaoRepo({ prisma: prismaMock });

    const out = await repo.findByPedidoId("ped-1");

    expect(prismaMock.producao.findUnique).toHaveBeenCalled();
    expect(out).toEqual({ id: "p1" });
  });

  it("list deve chamar prisma.producao.findMany", async () => {
    const prismaMock = {
      producao: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([{ id: "p1" }]),
        upsert: jest.fn(),
      },
    };

    const buildProducaoRepo = loadBuilder("../src/repo/producaoRepo", [
      "buildProducaoRepo",
      "build",
      "factory",
    ]);

    const repo = buildProducaoRepo({ prisma: prismaMock });

    const out = await repo.list();

    expect(prismaMock.producao.findMany).toHaveBeenCalled();
    expect(out).toEqual([{ id: "p1" }]);
  });
});
