const express = require("express");
const cors = require("cors");

function buildApp({ routes }) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // ✅ Healthcheck: não depende de nada (repo/prisma/gateway)
  app.get("/status", (_req, res) => {
    return res.status(200).json({ ok: true, service: "producao" });
  });

  // ✅ Pluga as rotas do sistema (quando existirem)
  if (routes) {
    app.use(routes);
  }

  return app;
}

module.exports = { buildApp };
