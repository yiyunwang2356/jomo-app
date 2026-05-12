const screens = [...document.querySelectorAll(".screen")];
const tabs = [...document.querySelectorAll(".tab")];
const historyStack = ["home"];
const venues = [
  {
    name: "Nomadd Haus",
    meta: "中山共享空間｜中山站 R2｜附商家連結",
    photo: "haus-photo",
    status: "緊鄰中山站 R2 出口，玻璃隔間與金屬質感設計，並以注音符號作為空間命名。",
    fit: "小型展覽、視訊簽售、小型觀影與應援交流。",
    action: "導流至 Nomadd Haus 官網詢問",
    linkLabel: "Nomadd Haus 官網",
    url: "https://nomaddhaus.com/",
    tags: ["前展覽區", "ㄈㄈ房", "ㄆㄩ房", "ㄒㄌ房", "ㄅㄎ房"],
  },
];

function setVenue(index) {
  const venue = venues[index] || venues[0];
  const photo = document.querySelector("[data-detail-photo]");
  const tags = document.querySelector("[data-detail-tags]");
  document.querySelector("[data-detail-name]").textContent = venue.name;
  document.querySelector("[data-detail-meta]").textContent = venue.meta;
  document.querySelector("[data-detail-status]").textContent = venue.status;
  document.querySelector("[data-detail-action]").textContent = venue.action;
  document.querySelector("[data-detail-fit]").textContent = venue.fit;
  const link = document.querySelector("[data-detail-link]");
  link.href = venue.url;
  link.innerHTML = `<span>開啟官方連結</span><strong>${venue.linkLabel}</strong>`;

  photo.className = `detail-photo ${venue.photo}`;
  tags.innerHTML = venue.tags.map((tag) => `<span>${tag}</span>`).join("");
}

function showScreen(id, push = true) {
  const target = document.getElementById(id);
  if (!target) return;

  screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.nav === id || (id === "detail" && tab.dataset.nav === "explore") || (id === "booking" && tab.dataset.nav === "explore") || (id === "confirm" && tab.dataset.nav === "explore") || (id === "complete" && tab.dataset.nav === "orders")));

  if (push && historyStack[historyStack.length - 1] !== id) {
    historyStack.push(id);
  }
}

window.JOMOShowScreen = showScreen;

document.addEventListener("click", (event) => {
  const navButton = event.target.closest("[data-nav]");
  if (navButton) {
    if (navButton.dataset.venueButton) {
      setVenue(Number(navButton.dataset.venueButton));
    }
    showScreen(navButton.dataset.nav);
  }

  if (event.target.closest("[data-back]")) {
    if (historyStack.length > 1) {
      historyStack.pop();
      showScreen(historyStack[historyStack.length - 1], false);
    } else {
      showScreen("home", false);
    }
  }

  const chip = event.target.closest(".chip");
  if (chip) {
    document.querySelectorAll(".chip").forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
  }

  const option = event.target.closest(".option");
  if (option) {
    option.classList.toggle("active");
  }

  const adminTab = event.target.closest("[data-admin-tab]");
  if (adminTab) {
    const panelId = adminTab.dataset.adminTab;
    document.querySelectorAll("[data-admin-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.adminTab === panelId);
    });
    document.querySelectorAll(".admin-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === panelId);
    });
  }
});
