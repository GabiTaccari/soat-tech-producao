require("dotenv").config();

const { buildLogger } = require("./logger");
const { prisma } = require("./db/prisma");
const { buildProducaoRepo } = require("./repo/producaoRepo");
const { buildPedidoGateway } = require("./gateways/pedidoGateway");
const { buildProducaoUseCases } = require("./usecases/producaoUseCases");
const { buildRoutes } = require("./routes");
const { buildApp } = require("./app");

async function main() {
  const logger = buildLogger();

  const repo = buildProducaoRepo({ prisma });
  const pedidoGateway = buildPedidoGateway({ baseUrl: process.env.PEDIDO_SERVICE_URL });
  const useCases = buildProducaoUseCases({ repo, pedidoGateway });

  const routes = buildRoutes({ useCases, logger });
  const app = buildApp({ routes });

  const port = Number(process.env.PORT || 3003);
  app.listen(port, () => logger.info({ port }, "producao-service up"));
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
