const { z } = require("zod");

const StatusSchema = z.object({
  status: z.enum(["AGUARDANDO","EM_PREPARACAO","PRONTO","FINALIZADO"])
});

function buildProducaoUseCases({ repo, pedidoGateway }) {
  async function listarFila() {
    // pedidos pagos (fonte de verdade do fluxo) + estados locais (cozinha)
    const pagos = await pedidoGateway.listarPagos();
    const locais = await repo.list();
    const map = new Map(locais.map(x => [x.pedidoId, x]));
    return pagos.map(p => ({
      pedidoId: p.id,
      status: map.get(p.id)?.status || "AGUARDANDO",
      total: p.total,
      pedidoStatus: p.status
    }));
  }

  async function iniciar(pedidoId) {
    if (!pedidoId) throw new Error("pedidoId obrigatório");
    const rec = await repo.upsertByPedidoId(pedidoId, "EM_PREPARACAO");
    await pedidoGateway.atualizarStatus(pedidoId, "EM_PREPARACAO");
    return rec;
  }

  async function atualizarStatus(pedidoId, input) {
    const { status } = StatusSchema.parse(input);
    const rec = await repo.upsertByPedidoId(pedidoId, status);
    const mapping = { AGUARDANDO: "PAGO", EM_PREPARACAO: "EM_PREPARACAO", PRONTO: "PRONTO", FINALIZADO: "FINALIZADO" };
    await pedidoGateway.atualizarStatus(pedidoId, mapping[status]);
    return rec;
  }

  return { listarFila, iniciar, atualizarStatus };
}

module.exports = { buildProducaoUseCases };
