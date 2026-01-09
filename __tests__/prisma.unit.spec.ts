describe("prisma (unit)", () => {
  it("deve exportar prisma", () => {
    const { prisma } = require("../src/db/prisma");
    expect(prisma).toBeDefined();
  });
});
