export interface AppPrerequisitesStatus {
  hostReady: boolean;
  configReady: boolean;
  timedOut: boolean;
}

const DEFAULT_HOST_SELECTOR = "#__next > div";
const DEFAULT_DEADLINE_MS = 1_000;
const DEFAULT_POLL_INTERVAL_MS = 50;

function getStatus(hostSelector: string): Omit<AppPrerequisitesStatus, "timedOut"> {
  const host = document.querySelector(hostSelector);
  return {
    hostReady: Boolean(host?.getBoundingClientRect().height),
    configReady: Array.isArray(window._promotion_settings),
  };
}

/** Ожидает готовность host и внешнего конфига, но не блокирует запуск дольше deadline. */
export function waitForAppPrerequisites(
  hostSelector = DEFAULT_HOST_SELECTOR,
  deadlineMs = DEFAULT_DEADLINE_MS,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
): Promise<AppPrerequisitesStatus> {
  const startedAt = Date.now();

  return new Promise(resolve => {
    const checkReady = () => {
      const status = getStatus(hostSelector);
      if (status.hostReady && status.configReady) {
        resolve({...status, timedOut: false});
        return;
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed >= deadlineMs) {
        resolve({...status, timedOut: true});
        return;
      }

      setTimeout(checkReady, Math.min(pollIntervalMs, deadlineMs - elapsed));
    };

    checkReady();
  });
}
