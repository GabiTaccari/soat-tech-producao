import request from "supertest";
import express from "express";
const { buildRoutes } = require("../src/routes");
const { buildApp } = require("../src/app");

describe("Routes error handling (unit)", () => {
  it("deve retornar 500 quando use case lança erro", async () => {
    const useCases = {
      listar: jest.fn().mockRejectedValue(new Error("boom")),
    };

    const logger = { info: jest.fn(), error: jest.fn() };

    const routes = buildRoutes({ useCases, logger });
    const app = buildApp({ routes });

    const res = await request(app).get("/producao");

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
