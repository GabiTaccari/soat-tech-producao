import request from "supertest";
import express from "express";
const { buildRoutes } = require("../src/routes");
const { buildApp } = require("../src/app");

describe("Routes (unit)", () => {
  it("GET /status deve responder corretamente", async () => {
    const useCases = {}; // status não depende
    const logger = { info: jest.fn(), error: jest.fn() };

    const routes = buildRoutes({ useCases, logger });
    const app = buildApp({ routes });

    const res = await request(app).get("/status");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
  });
});
