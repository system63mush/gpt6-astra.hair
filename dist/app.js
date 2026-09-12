"use strict";

// Public contact configuration. Replace the QR asset here when changing support.
const CONTACT = {
  qrImage: "assets/wechat-support.jpg",
  downloadName: "客服微信二维码.jpg",
};
const PLANS = Object.freeze({
  plusSpecial: { name: "ChatGPT Plus 特价", price: 155, unit: "月" },
  go: { name: "ChatGPT Go", price: 79, unit: "月" },
  plus: { name: "ChatGPT Plus", price: 168, unit: "月" },
  pro5: { name: "ChatGPT Pro 5X", price: 825, unit: "月" },
  pro20: { name: "ChatGPT Pro 20X", price: 1480, unit: "月" },
  claudePro: { name: "Claude Pro 订阅协助", price: 188, unit: "" },
  claudeMax5: { name: "Claude Max 5X", price: 850, unit: "" },
  claudeMax20: { name: "Claude Max 20X", price: 1580, unit: "" },
  gemini1m: { name: "Gemini 开通 1个月", price: 120, unit: "1个月" },
  gemini3m: { name: "Gemini 开通 3个月", price: 320, unit: "3个月" },
  gemini1y: { name: "Gemini 开通 1年", price: 368, unit: "年" },
  grok1m: { name: "Grok Super 1个月", price: 180, unit: "1个月" },
});
const dialog = document.getElementById("contact-dialog");
const selectedPlan = document.getElementById("selected-plan");
const qr = document.getElementById("wechat-qr");
const saveQr = document.querySelector(".save-qr");
let lastTrigger = null;
let previousOverflow = "";
qr.src = CONTACT.qrImage;
saveQr.href = CONTACT.qrImage;
saveQr.download = CONTACT.downloadName;

const cards = [...document.querySelectorAll(".plan-card")];
const lastPlanByPanel = new Map();

function selectProduct(card) {
  if (!card) return;
  cards.forEach((item) => {
    const selected = item === card;
    item.classList.toggle("is-selected", selected);
    item.querySelector(".plan-choice").checked = selected;
    item.querySelector(".plan-button").classList.toggle("primary", selected);
  });
  lastPlanByPanel.set(card.closest('[role="tabpanel"]').id, card.dataset.cardPlan);
}

cards.forEach((card) => {
  card.querySelector(".plan-choice").addEventListener("change", () => selectProduct(card));
});
selectProduct(cards.find((card) => card.querySelector(".plan-choice").checked) || cards[0]);

function showContact(trigger, planId) {
  const plan = PLANS[planId];
  if (plan) selectProduct(trigger.closest(".plan-card"));
  selectedPlan.hidden = !plan;
  if (plan) {
    document.getElementById("selected-plan-name").textContent = plan.name;
    document.getElementById("selected-plan-price").textContent = `参考 ¥${plan.price}${plan.unit ? ` / ${plan.unit}` : ""}`;
  }
  lastTrigger = trigger;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  dialog.showModal();
}

document.querySelectorAll("[data-plan], [data-contact]").forEach((button) => {
  button.addEventListener("click", () => showContact(button, button.dataset.plan));
});
dialog.querySelector(".close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.style.overflow = previousOverflow;
  if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab) {
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    item.classList.toggle("active", selected);
    const panel = document.getElementById(item.getAttribute("aria-controls"));
    panel.hidden = !selected;
    panel.querySelectorAll(".plan-choice").forEach((radio) => { radio.disabled = !selected; });
  });
  const panel = document.getElementById(tab.getAttribute("aria-controls"));
  const panelCards = [...panel.querySelectorAll(".plan-card")];
  selectProduct(panelCards.find((card) => card.dataset.cardPlan === lastPlanByPanel.get(panel.id)) || panelCards[0]);
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    activateTab(tabs[next]);
    tabs[next].focus();
  });
});

// Card clicks select the product; only the recharge button opens the QR dialog.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const hoverPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const resetCardEffects = [];

cards.forEach((card) => {
  const effects = document.createElement("span");
  effects.className = "card-effects";
  effects.setAttribute("aria-hidden", "true");
  const ripple = document.createElement("span");
  ripple.className = "card-ripple";
  effects.append(ripple);
  card.append(effects);

  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let rippleAnimation = null;

  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    card.classList.remove("is-pressed");
    card.style.removeProperty("--glow-x");
    card.style.removeProperty("--glow-y");
    rippleAnimation?.cancel();
    rippleAnimation = null;
  };
  resetCardEffects.push(reset);

  card.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || !hoverPointer.matches || event.pointerType === "touch") return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--glow-x", `${pointerX - bounds.left}px`);
      card.style.setProperty("--glow-y", `${pointerY - bounds.top}px`);
    });
  });
  card.addEventListener("pointerleave", reset);
  card.addEventListener("pointercancel", reset);
  card.addEventListener("pointerdown", (event) => {
    if (event.button === 0 && !reducedMotion.matches) card.classList.add("is-pressed");
  });
  card.addEventListener("click", (event) => {
    card.classList.remove("is-pressed");
    if (event.button > 0) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && card.contains(selection.anchorNode)) return;
    selectProduct(card);
    if (reducedMotion.matches) return;

    const bounds = card.getBoundingClientRect();
    const x = event.detail === 0 ? bounds.width / 2 : event.clientX - bounds.left;
    const y = event.detail === 0 ? bounds.height / 2 : event.clientY - bounds.top;
    const diameter = Math.hypot(bounds.width, bounds.height) * 2;
    ripple.style.width = `${diameter}px`;
    ripple.style.height = `${diameter}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    rippleAnimation?.cancel();
    rippleAnimation = ripple.animate([
      { transform: "translate(-50%, -50%) scale(0)", opacity: 0.19 },
      { opacity: 0.10, offset: 0.4 },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 0 },
    ], { duration: 650, easing: "cubic-bezier(.2,.7,.3,1)" });
  });
});

function releaseCardPress() {
  cards.forEach((card) => card.classList.remove("is-pressed"));
}
window.addEventListener("pointerup", releaseCardPress);
window.addEventListener("pointercancel", releaseCardPress);
window.addEventListener("blur", () => resetCardEffects.forEach((reset) => reset()));
reducedMotion.addEventListener("change", () => resetCardEffects.forEach((reset) => reset()));
hoverPointer.addEventListener("change", () => resetCardEffects.forEach((reset) => reset()));
tabs.forEach((tab) => tab.addEventListener("click", () => resetCardEffects.forEach((reset) => reset())));
