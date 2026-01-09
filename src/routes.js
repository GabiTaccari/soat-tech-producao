const express = require("express");

function buildRoutes({ useCases, logger }) {
  const r = express.Router();

  r.get("/health", (_req, res) => res.json({ ok: true, service: "producao" }));

  r.get("/fila", async (_req, res) => {
    try {
      const fila = await useCases.listarFila();
      res.json(fila);
    } catch (e) {
      logger.warn({ err: e }, "erro ao listar fila");
      res.status(400).json({ error: e.message });
    }
  });

  r.post("/producao/:pedidoId/iniciar", async (req, res) => {
    try {
      const rec = await useCases.iniciar(req.params.pedidoId);
      res.json(rec);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  r.patch("/producao/:pedidoId/status", async (req, res) => {
    try {
      const rec = await useCases.atualizarStatus(req.params.pedidoId, req.body);
      res.json(rec);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  return r;
}

module.exports = { buildRoutes };
