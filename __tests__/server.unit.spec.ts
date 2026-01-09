/* eslint-disable @typescript-eslint/no-var-requires */

function loadMainOrAutoRun(modulePath: string) {
  const mod = require(modulePath);
  if (typeof mod === "function") return mod;
  if (mod && typeof mod.main === "function") return mod.main;
  if (mod && typeof mod.start === "function") return mod.start;
  return null; // se executar no import
}

describe("server (unit)", () => {
  const originalExit = process.exit;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    (process as any).exit = jest.fn() as any;
    process.env.PORT = "3001";
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  it("deve iniciar app sem encerrar o processo", async () => {
    const listenMock = jest.fn((_port: number, cb?: Function) => cb && cb());

    // server.js chama buildApp(), então ../src/app PRECISA ser função.
    jest.doMock("../src/app", () => {
      return {
        __esModule: true,
        default: () => ({ listen: listenMock }), // caso import default
        buildApp: () => ({ listen: listenMock }), // caso named export
        // caso module.exports = function buildApp() {}
        ...(function () {
          const fn = () => ({ listen: listenMock });
          // @ts-ignore
          fn.buildApp = fn;
          return fn;
        })(),
      };
    });

    const main = loadMainOrAutoRun("../src/server");

    if (main) {
      await expect(main()).resolves.toBeDefined();
    }

    expect(process.exit).not.toHaveBeenCalled();
    expect(listenMock).toHaveBeenCalled();
  });
});
