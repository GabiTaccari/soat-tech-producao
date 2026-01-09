const axios = require("axios");

function buildPedidoGateway({ baseUrl }) {
  if (!baseUrl) throw new Error("PEDIDO_SERVICE_URL obrigatório");

  return {
    async listarPagos() {
      const { data } = await axios.get(`${baseUrl}/api/pedidos`, {
        params: { status: "PAGO" },
      });
      return data;
    },

    async atualizarStatus(pedidoId, status) {
      await axios.patch(`${baseUrl}/api/pedidos/${pedidoId}/status`, { status });
    },
  };
}

module.exports = { buildPedidoGateway };
