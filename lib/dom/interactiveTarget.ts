const INTERACTIVE_SELECTOR = '.MuiButtonBase-root, a, [role="button"]';

/**
 * Finds the nearest interactive ancestor (MUI ButtonBase controls, links,
 * role="button") or, failing that, treats the target as interactive if its
 * computed cursor is "pointer" — covers clickable Cards/TableRows/Boxes in
 * this codebase that set `cursor: "pointer"` in sx without being a real
 * button element. `cursor` is CSS-inherited, so this also matches clicks/
 * hovers landing on a child of such an element.
 */
export function findInteractiveTarget(target: Element | null): Element | null {
  if (!target) return null;
  const matched = target.closest(INTERACTIVE_SELECTOR);
  if (matched) return matched;
  if (typeof window !== "undefined" && window.getComputedStyle(target).cursor === "pointer") {
    return target;
  }
  return null;
}
