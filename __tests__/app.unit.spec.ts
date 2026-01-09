import request from "supertest";
import express from "express";
const { buildApp } = require("../src/app");

describe("buildApp (unit)", () => {
  it("deve criar uma aplicação express funcional", async () => {
    const routes = express.Router();
    routes.get("/ping", (_req, res) => res.json({ pong: true }));

    const app = buildApp({ routes });

    const res = await request(app).get("/ping");

    expect(res.status).toBe(200);
    expect(res.body.pong).toBe(true);
  });
});
