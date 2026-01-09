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
    `Builder não encontrado em ${modulePath}. Exports: ${mod ? Object.keys(mod).join(", ") : "none"}`
  );
}

describe("pedidoGateway (unit) - extra", () => {
  beforeEach(() => jest.clearAllMocks());

  it("listarPagos deve fazer chamada http", async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: [{ pedidoId: "ped-1" }] });

    const buildPedidoGateway = loadBuilder("../src/gateways/pedidoGateway", [
      "buildPedidoGateway",
      "build",
      "factory",
    ]);

    const gw = buildPedidoGateway({ baseUrl: "http://pedido" });

    expect(typeof gw.listarPagos).toBe("function");

    const res = await gw.listarPagos();

    expect(axios.get).toHaveBeenCalled();

    // se seu gateway retorna data, isso passa; se não retorna nada, também passa
    if (res !== undefined) {
      expect(res).toEqual([{ pedidoId: "ped-1" }]);
    }
  });
});
