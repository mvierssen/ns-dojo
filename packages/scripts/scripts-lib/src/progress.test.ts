import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";

describe("Progress Utils", () => {
  let stdoutWriteSpy: MockInstance;

  beforeEach(() => {
    stdoutWriteSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWriteSpy.mockRestore();
  });

  describe("showProgress", () => {
    it("should show progress bar", async () => {
      const {showProgress} = await import("./progress.js");

      showProgress(5, 10, "Processing");

      expect(stdoutWriteSpy).toHaveBeenCalled();
      const output = stdoutWriteSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain("Processing:");
      expect(output).toContain("50%");
      expect(output).toContain("(5/10)");
    });

    it("should show completed progress with newline", async () => {
      const {showProgress} = await import("./progress.js");

      showProgress(10, 10, "Complete");

      expect(stdoutWriteSpy).toHaveBeenCalledTimes(2); // Progress + newline
      const progressOutput = stdoutWriteSpy.mock.calls[0]?.[0] as string;
      expect(progressOutput).toContain("100%");
      expect(progressOutput).toContain("(10/10)");
      expect(stdoutWriteSpy.mock.calls[1]?.[0]).toBe("\n");
    });

    it("should use default description", async () => {
      const {showProgress} = await import("./progress.js");

      showProgress(1, 2);

      const output = stdoutWriteSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain("Processing:");
    });

    it("should use custom width", async () => {
      const {showProgress} = await import("./progress.js");

      showProgress(5, 10, "Loading", 20);

      expect(stdoutWriteSpy).toHaveBeenCalled();
      const output = stdoutWriteSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain("Loading:");
    });
  });

  describe("setupCleanup", () => {
    it("should register cleanup handlers", async () => {
      const onSpy = vi.spyOn(process, "on");
      const {setupCleanup} = await import("./progress.js");

      const cleanup = vi.fn();
      setupCleanup(cleanup);

      expect(onSpy).toHaveBeenCalledWith("exit", expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith("SIGTERM", expect.any(Function));

      onSpy.mockRestore();
    });
  });

  describe("Spinner", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should start and stop spinner", async () => {
      const {Spinner} = await import("./progress.js");

      const spinner = new Spinner("Loading");
      spinner.start();

      // Advance timers to trigger animation
      vi.advanceTimersByTime(100);

      expect(stdoutWriteSpy).toHaveBeenCalled();

      spinner.stop("Done");

      expect(stdoutWriteSpy).toHaveBeenCalledWith(
        expect.stringContaining("Done"),
      );
    });

    it("should show success message", async () => {
      const {Spinner} = await import("./progress.js");

      const spinner = new Spinner("Loading");
      spinner.start();
      spinner.succeed("Success!");

      const lastCall = stdoutWriteSpy.mock.calls.at(-1)?.[0] as string;
      expect(lastCall).toContain("✓");
      expect(lastCall).toContain("Success!");
    });

    it("should show failure message", async () => {
      const {Spinner} = await import("./progress.js");

      const spinner = new Spinner("Loading");
      spinner.start();
      spinner.fail("Failed!");

      const lastCall = stdoutWriteSpy.mock.calls.at(-1)?.[0] as string;
      expect(lastCall).toContain("✗");
      expect(lastCall).toContain("Failed!");
    });
  });
});
