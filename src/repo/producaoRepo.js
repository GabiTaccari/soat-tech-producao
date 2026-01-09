function buildProducaoRepo({ prisma }) {
  return {
    upsertByPedidoId: (pedidoId, status) =>
      prisma.producao.upsert({
        where: { pedidoId },
        update: { status },
        create: { pedidoId, status }
      }),
    findByPedidoId: (pedidoId) => prisma.producao.findUnique({ where: { pedidoId } }),
    list: () => prisma.producao.findMany({ orderBy: { updatedAt: "desc" } })
  };
}

module.exports = { buildProducaoRepo };
