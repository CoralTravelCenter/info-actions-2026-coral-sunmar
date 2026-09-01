/**
 * v-clipboard="text" — копирует значение в буфер по клику.
 *
 * Своя реализация (без сторонних пакетов): современный `navigator.clipboard`
 * с legacy-фолбэком на `execCommand` для http-контекста и старых браузеров.
 *
 * События на элементе: `clipboard:success` / `clipboard:error`,
 * в `detail` — `{ ok, text, error }`.
 *
 * Актуальное значение и функция очистки хранятся в WeakMap, не расширяя DOM-элемент.
 */

import type {Directive} from "vue";

interface ClipboardOptions {
  text?: string;
  onSuccess?: (text: string) => void;
  onError?: (error: unknown) => void;
}

type ClipboardBindingValue = string | ClipboardOptions;

const cleanupByElement = new WeakMap<HTMLElement, () => void>();
const valueByElement = new WeakMap<HTMLElement, ClipboardBindingValue>();

/**
 * @param {unknown} value Значение директивы.
 * @param {HTMLElement} el
 * @returns {string}
 */
function resolveText(value: ClipboardBindingValue, el: HTMLElement): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.text ?? "";
  return el.innerText || "";
}

/**
 * @param {string} text
 * @returns {Promise<boolean>} Удалось ли скопировать современным API.
 */
async function copyModern(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;
  await navigator.clipboard.writeText(text);
  return true;
}

/**
 * Фолбэк для http и браузеров без Clipboard API.
 * @param {string} text
 * @returns {boolean}
 */
function copyLegacy(text: string): boolean {
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

const clipboard: Directive<HTMLElement, ClipboardBindingValue> = {
  mounted(el, binding) {
    valueByElement.set(el, binding.value);

    const handler = async () => {
      const value = valueByElement.get(el) ?? binding.value;
      const text = resolveText(value, el);
      let ok = false;
      let error: unknown = null;

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

      if (typeof value === "object") {
        if (ok) value.onSuccess?.(text);
        else value.onError?.(error);
      }
    };

    el.addEventListener("click", handler);
    cleanupByElement.set(el, () => el.removeEventListener("click", handler));
  },

  updated(el, binding) {
    valueByElement.set(el, binding.value);
  },

  unmounted(el) {
    cleanupByElement.get(el)?.();
    cleanupByElement.delete(el);
    valueByElement.delete(el);
  },
};

export default clipboard;
