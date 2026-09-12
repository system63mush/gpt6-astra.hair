"use strict";

// Public contact configuration. Replace the QR asset here when changing support.
const CONTACT = {
  qrImage: "assets/wechat-support-2.jpg",
  downloadName: "客服微信二维码.jpg",
};
const PLANS = Object.freeze({
  go: { name: "ChatGPT Go", price: 79, unit: "月" },
  plus: { name: "ChatGPT Plus", price: 168, unit: "月" },
  pro5: { name: "ChatGPT Pro 5X", price: 825, unit: "月" },
  pro20: { name: "ChatGPT Pro 20X", price: 1480, unit: "月" },
  basic: { name: "ChatGPT 普通号", price: 15, unit: "个" },
  ready: { name: "ChatGPT Plus 成品号", price: 176, unit: "个" },
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

function showContact(trigger, planId) {
  const plan = PLANS[planId];
  selectedPlan.hidden = !plan;
  if (plan) {
    document.getElementById("selected-plan-name").textContent = plan.name;
    document.getElementById("selected-plan-price").textContent = `参考 ¥${plan.price} / ${plan.unit}`;
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
    document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
  });
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
