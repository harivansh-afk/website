<script>
  // code definitions: hover (or focus) a name in a code block, get its
  // definition the way an editor shows it. The markup is built at prerender by
  // $lib/highlight.server.js: names are `[data-def=key]` spans and each block
  // carries `<template data-def-key=key>` popover content. On touch screens a
  // tap toggles the popover and a tap elsewhere closes it. `#def=<key>` pins
  // one open for screenshots. Hover vs tap is decided per pointer event, so
  // hybrid devices get both.
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";

  const LINGER_MS = 100;
  const GAP = 4;
  const EDGE = 12;

  let pop = $state(); // the popover element
  let enabled = $state(false);
  let visible = $state(false);
  let passive = $state(false); // opened by mouse hover: ignore the pointer
  let anchor = null; // the name the popover belongs to
  let pointer = "mouse"; // type of the last pointer: mice hover, touch and pens tap
  let pinned = false;
  let lingerTimer = 0;

  const templateFor = (key) => document.querySelector(`template[data-def-key="${CSS.escape(key)}"]`);

  function hide() {
    clearTimeout(lingerTimer);
    anchor?.removeAttribute("aria-describedby");
    anchor = null;
    pinned = false;
    visible = false;
  }

  function linger() {
    clearTimeout(lingerTimer);
    lingerTimer = setTimeout(hide, LINGER_MS);
  }

  // Below the name, flipped above when it does not fit, clamped to the viewport.
  // The popover is fixed at the layout root, so code-block scrolling cannot clip it.
  function place(el) {
    const p = pop.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const left = Math.max(EDGE, Math.min(r.left, innerWidth - p.width - EDGE));
    let top = r.bottom + GAP;
    if (top + p.height > innerHeight - EDGE && r.top - GAP - p.height >= EDGE) top = r.top - GAP - p.height;
    top = Math.max(EDGE, Math.min(top, innerHeight - p.height - EDGE));
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function show(el) {
    clearTimeout(lingerTimer);
    if (el === anchor) return;
    const tpl = templateFor(el.dataset.def);
    if (!tpl) return;
    anchor?.removeAttribute("aria-describedby");
    anchor = el;
    pop.replaceChildren(tpl.content.cloneNode(true));
    // match the code the name sits in, whatever size that block renders at
    pop.style.fontSize = getComputedStyle(el).fontSize;
    el.setAttribute("aria-describedby", "code-def");
    visible = true;
    place(el);
  }

  const target = (e) => e.target.closest?.("[data-def]");
  const inPop = (node) => node && pop?.contains(node);

  // A mouse-opened popover is click-through: the pointer passes over it to
  // the code underneath, and leaving the name closes it.
  function over(e) {
    if (e.pointerType !== "mouse") return;
    const el = target(e);
    if (el) {
      passive = true;
      show(el);
    }
  }

  function out(e) {
    if (e.pointerType !== "mouse" || pinned || !anchor) return;
    if (!target(e)) return;
    if (e.relatedTarget && anchor.contains(e.relatedTarget)) return;
    linger();
  }

  function focusIn(e) {
    const el = target(e);
    if (el && el.matches(":focus-visible")) {
      passive = false;
      show(el);
    }
  }

  function focusOut(e) {
    if (pinned || !anchor) return;
    if (!target(e) && !inPop(e.target)) return;
    if (e.relatedTarget && (anchor.contains(e.relatedTarget) || inPop(e.relatedTarget))) return;
    hide();
  }

  function click(e) {
    if (pointer === "mouse" || inPop(e.target)) return;
    const el = target(e);
    passive = false;
    if (el && el !== anchor) show(el);
    else hide();
  }

  function keydown(e) {
    if (e.key === "Escape" && anchor) {
      const el = anchor;
      hide();
      if (document.activeElement && inPop(document.activeElement)) el.focus();
    }
  }

  function scrolled() {
    if (!pinned && anchor) hide();
  }

  // the first load is an "enter" navigation; closing then would drop a #def= pin
  afterNavigate(({ type }) => type !== "enter" && hide());

  onMount(() => {
    enabled = true;
    document.documentElement.classList.add("code-defs");
    // capture: a code block's own horizontal scroll does not bubble
    addEventListener("scroll", scrolled, { capture: true, passive: true });
    addEventListener("resize", scrolled, { passive: true });

    const pin = location.hash.match(/^#def=(.+)$/);
    if (pin) {
      const key = decodeURIComponent(pin[1]);
      const el = document.querySelector(`[data-def="${CSS.escape(key)}"]`);
      if (el) {
        el.scrollIntoView({ block: "center" });
        show(el);
        pinned = true;
      }
    }

    return () => {
      removeEventListener("scroll", scrolled, { capture: true });
      removeEventListener("resize", scrolled);
      document.documentElement.classList.remove("code-defs");
    };
  });
</script>

<svelte:document
  onpointerover={enabled ? over : undefined}
  onpointerout={enabled ? out : undefined}
  onpointerdown={enabled ? (e) => (pointer = e.pointerType) : undefined}
  onfocusin={enabled ? focusIn : undefined}
  onfocusout={enabled ? focusOut : undefined}
  onclick={enabled ? click : undefined}
  onkeydown={enabled ? keydown : undefined}
/>

<!-- always rendered (empty and hidden) so a #def= pin can fill it during onMount -->
<div id="code-def" class="def-pop" class:on={visible} class:passive role="tooltip" bind:this={pop}></div>
