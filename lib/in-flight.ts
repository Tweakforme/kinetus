/**
 * One action at a time, decided synchronously. React's pending state only changes after a
 * re-render, so two activations of a button in the same task (a script, some assistive
 * technology) both saw "not pending" and both sent Add to cart. This flag is set before
 * the first returns, so the second finds it set and is ignored. Pure, so node:test runs it
 * (lib/in-flight.test.ts).
 */
export type InFlight = {
  /** Marks the action started and returns true, or returns false while one is running. */
  start(): boolean;
  /** Marks the running action finished (call it however the action ended). */
  finish(): void;
};

export function createInFlight(): InFlight {
  let running = false;
  return {
    start() {
      if (running) {
        return false;
      }
      running = true;
      return true;
    },
    finish() {
      running = false;
    },
  };
}
