import { ref } from "vue";

/**
 * Pointer-driven pressed state for instant, native-feeling button feedback.
 *
 * `:active` lags on iOS because Safari waits to disambiguate tap vs scroll;
 * `pointerdown` fires immediately, and `pointercancel` clears the state if the
 * gesture turns into a scroll. Bind `on` to an element with `v-on` and toggle
 * a class from `pressed`.
 */
export function usePressed() {
  const pressed = ref(false);
  const on = {
    pointerdown: () => (pressed.value = true),
    pointerup: () => (pressed.value = false),
    pointercancel: () => (pressed.value = false),
    pointerleave: () => (pressed.value = false),
  };
  return { pressed, on };
}
