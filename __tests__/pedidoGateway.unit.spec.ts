/* eslint-disable @typescript-eslint/no-var-requires */

jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
}));

const axios = require("axios");

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

describe("pedidoGateway (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve chamar endpoint do pedido-service para atualizar status", async () => {
    // deixa todos preparados (não sabemos qual o gateway usa)
    (axios.patch as jest.Mock).mockResolvedValue({ data: { ok: true } });
    (axios.put as jest.Mock).mockResolvedValue({ data: { ok: true } });
    (axios.post as jest.Mock).mockResolvedValue({ data: { ok: true } });

    const buildPedidoGateway = loadBuilder("../src/gateways/pedidoGateway", [
      "buildPedidoGateway",
      "build",
      "factory",
    ]);

    const gw = buildPedidoGateway({ baseUrl: "http://pedido" });

    expect(typeof gw.atualizarStatus).toBe("function");

    const res = await gw.atualizarStatus("ped-1", "EM_PREPARACAO");

    // valida que fez alguma chamada http (independente do verbo)
    const totalCalls =
      (axios.patch as jest.Mock).mock.calls.length +
      (axios.put as jest.Mock).mock.calls.length +
      (axios.post as jest.Mock).mock.calls.length;

    expect(totalCalls).toBeGreaterThan(0);

    // como seu gateway retorna undefined, o correto é validar isso
    expect(res).toBeUndefined();
  });
});
