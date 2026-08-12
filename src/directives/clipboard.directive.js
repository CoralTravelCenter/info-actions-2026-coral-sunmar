/**
 * v-clipboard="text" — копирует значение в буфер по клику.
 *
 * Своя реализация (без сторонних пакетов): современный `navigator.clipboard`
 * с legacy-фолбэком на `execCommand` для http-контекста и старых браузеров.
 *
 * События на элементе: `clipboard:success` / `clipboard:error`,
 * в `detail` — `{ ok, text, error }`.
 *
 * Что почистили: мёртвый хук `updated`, писавший `dataset.clipboardText`,
 * который нигде не читался; хук выравнен с остальными директивами (`unmounted`),
 * служебное поле переведено на `Symbol`.
 */

/** Служебное поле: единое соглашение об именовании для всех директив. */
const CLEANUP = Symbol("clipboardCleanup");

/**
 * @param {unknown} value Значение директивы.
 * @param {HTMLElement} el
 * @returns {string}
 */
function resolveText(value, el) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "text" in value) return value.text || "";
  return el.innerText || "";
}

/**
 * @param {string} text
 * @returns {Promise<boolean>} Удалось ли скопировать современным API.
 */
async function copyModern(text) {
  if (!navigator.clipboard?.writeText) return false;
  await navigator.clipboard.writeText(text);
  return true;
}

/**
 * Фолбэк для http и браузеров без Clipboard API.
 * @param {string} text
 * @returns {boolean}
 */
function copyLegacy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  document.body.removeChild(textarea);
  return ok;
}

export default {
  mounted(el, binding) {
    const handler = async () => {
      const text = resolveText(binding.value, el);
      let ok = false;
      let error = null;

      try {
        ok = (await copyModern(text)) || copyLegacy(text);
      } catch (e) {
        error = e;
        ok = copyLegacy(text);
      }

      el.dispatchEvent(
        new CustomEvent(ok ? "clipboard:success" : "clipboard:error", {
          bubbles: true,
          detail: {ok, text, error},
        })
      );

      const value = binding.value;
      if (value && typeof value === "object") {
        if (ok) value.onSuccess?.(text);
        else value.onError?.(error);
      }
    };

    el.addEventListener("click", handler);
    el[CLEANUP] = () => el.removeEventListener("click", handler);
  },

  unmounted(el) {
    el[CLEANUP]?.();
    el[CLEANUP] = undefined;
  },
};
