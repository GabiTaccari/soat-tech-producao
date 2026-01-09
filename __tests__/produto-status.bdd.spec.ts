import request from "supertest";
const { buildApp } = require("../src/app");

describe("Producao Service - Status (BDD)", () => {
  it("GIVEN o serviço está no ar, WHEN chamar GET /status, THEN retorna 200 e ok:true", async () => {
    const app = buildApp({ routes: null });

    const res = await request(app).get("/status");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body).toHaveProperty("service", "producao");
  });
});
