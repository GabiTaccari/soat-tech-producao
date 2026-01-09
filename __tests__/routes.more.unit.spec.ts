/* eslint-disable @typescript-eslint/no-var-requires */

jest.mock("express", () => {
  const handlers: Record<string, any> = {};

  const router = {
    get: jest.fn((path: string, fn: any) => {
      handlers[`GET ${path}`] = fn;
      return router;
    }),
    post: jest.fn((path: string, fn: any) => {
      handlers[`POST ${path}`] = fn;
      return router;
    }),
    patch: jest.fn((path: string, fn: any) => {
      handlers[`PATCH ${path}`] = fn;
      return router;
    }),
    __handlers: handlers,
  };

  return {
    Router: jest.fn(() => router),
    __router: router,
  };
});

const express = require("express");

function makeRes() {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("routes (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // limpa handlers
    const r = (express as any).__router;
    Object.keys(r.__handlers).forEach((k) => delete r.__handlers[k]);
  });

  it("GET /health deve retornar ok + service", async () => {
    const { buildRoutes } = require("../src/routes");
    buildRoutes({ useCases: {}, logger: { warn: jest.fn() } });

    const r = (express as any).__router;
    const handler = r.__handlers["GET /health"];
    expect(handler).toBeDefined();

    const res = makeRes();
    await handler({}, res);

    expect(res.json).toHaveBeenCalledWith({ ok: true, service: "producao" });
  });

  it("GET /fila deve retornar fila quando useCases.listarFila resolve", async () => {
    const { buildRoutes } = require("../src/routes");

    const useCases = { listarFila: jest.fn().mockResolvedValue([{ pedidoId: "p1" }]) };
    const logger = { warn: jest.fn() };

    buildRoutes({ useCases, logger });

    const r = (express as any).__router;
    const handler = r.__handlers["GET /fila"];

    const res = makeRes();
    await handler({}, res);

    expect(useCases.listarFila).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([{ pedidoId: "p1" }]);
    expect(logger.warn).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("GET /fila deve logar warn e retornar 400 quando useCases.listarFila rejeita", async () => {
    const { buildRoutes } = require("../src/routes");

    const useCases = { listarFila: jest.fn().mockRejectedValue(new Error("falhou")) };
    const logger = { warn: jest.fn() };

    buildRoutes({ useCases, logger });

    const r = (express as any).__router;
    const handler = r.__handlers["GET /fila"];

    const res = makeRes();
    await handler({}, res);

    expect(logger.warn).toHaveBeenCalled(); // cobre logger.warn({err}, ...)
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "falhou" });
  });

  it("POST /producao/:pedidoId/iniciar deve chamar useCases.iniciar e retornar rec", async () => {
    const { buildRoutes } = require("../src/routes");

    const useCases = { iniciar: jest.fn().mockResolvedValue({ id: "rec1" }) };
    const logger = { warn: jest.fn() };

    buildRoutes({ useCases, logger });

    const r = (express as any).__router;
    const handler = r.__handlers["POST /producao/:pedidoId/iniciar"];

    const req = { params: { pedidoId: "ped-1" } };
    const res = makeRes();

    await handler(req, res);

    expect(useCases.iniciar).toHaveBeenCalledWith("ped-1");
    expect(res.json).toHaveBeenCalledWith({ id: "rec1" });
  });

  it("POST /producao/:pedidoId/iniciar deve retornar 400 em erro", async () => {
    const { buildRoutes } = require("../src/routes");

    const useCases = { iniciar: jest.fn().mockRejectedValue(new Error("x")) };
    const logger = { warn: jest.fn() };

    buildRoutes({ useCases, logger });

    const r = (express as any).__router;
    const handler = r.__handlers["POST /producao/:pedidoId/iniciar"];

    const req = { params: { pedidoId: "ped-1" } };
    const res = makeRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "x" });
  });

  it("PATCH /producao/:pedidoId/status deve chamar useCases.atualizarStatus com body e retornar rec", async () => {
    const { buildRoutes } = require("../src/routes");

    const useCases = { atualizarStatus: jest.fn().mockResolvedValue({ ok: true }) };
    const logger = { warn: jest.fn() };

    buildRoutes({ useCases, logger });

    const r = (express as any).__router;
    const handler = r.__handlers["PATCH /producao/:pedidoId/status"];

    const req = { params: { pedidoId: "ped-1" }, body: { status: "PRONTO" } };
    const res = makeRes();

    await handler(req, res);

    expect(useCases.atualizarStatus).toHaveBeenCalledWith("ped-1", { status: "PRONTO" });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("PATCH /producao/:pedidoId/status deve retornar 400 em erro", async () => {
    const { buildRoutes } = require("../src/routes");

    const useCases = { atualizarStatus: jest.fn().mockRejectedValue(new Error("bad")) };
    const logger = { warn: jest.fn() };

    buildRoutes({ useCases, logger });

    const r = (express as any).__router;
    const handler = r.__handlers["PATCH /producao/:pedidoId/status"];

    const req = { params: { pedidoId: "ped-1" }, body: { status: "PRONTO" } };
    const res = makeRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "bad" });
  });
});
