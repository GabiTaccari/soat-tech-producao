describe("server (unit)", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env = {
      ...OLD_ENV,
      PEDIDO_SERVICE_URL: "http://pedido",
    };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  function pickStartFn(mod: any) {
    if (!mod) return null;

    // formatos comuns de export
    if (typeof mod === "function") return mod;
    if (typeof mod.main === "function") return mod.main;
    if (typeof mod.start === "function") return mod.start;
    if (typeof mod.bootstrap === "function") return mod.bootstrap;
    if (typeof mod.run === "function") return mod.run;

    return null;
  }

  it("deve iniciar o app sem encerrar o processo", async () => {
    const listenMock = jest.fn();

    // mock do buildApp (seu server chama isso por dentro)
    jest.doMock("../src/app", () => ({
      buildApp: () => ({ listen: listenMock }),
    }));

    // evita que testes "matem" o processo se server tiver catch com exit
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    // (opcional) silencia console.error do server em caso de falha
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const mod = require("../src/server");
    const start = pickStartFn(mod);

    if (start) {
      await start();
    } else {
      // caso "auto-run": só dar require já executa e deve chamar listen
      // então não chamamos nada aqui.
    }

    expect(exitSpy).not.toHaveBeenCalled();
    expect(listenMock).toHaveBeenCalled();

    errSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
