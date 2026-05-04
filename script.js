const screens = [...document.querySelectorAll(".screen")];
const tabs = [...document.querySelectorAll(".tab")];
const historyStack = ["home"];
const venues = [
  {
    name: "Nomadd Haus",
    meta: "中山站 R2｜展覽與快閃複合空間｜附商家連結",
    photo: "haus-photo",
    status: "緊鄰中山站 R2 出口，玻璃隔間與金屬質感設計，並以注音符號作為空間命名。",
    fit: "攝影展、應援交換集市、高品質視訊簽售。",
    action: "導流至 Nomadd Haus 官網詢問",
    linkLabel: "Nomadd Haus 官網",
    url: "https://nomaddhaus.com/",
    tags: ["攝影展", "交換集市", "視訊簽售", "高質感背景"],
  },
  {
    name: "e.rooms",
    meta: "赤峰街｜專業 Pop-up Space｜附預約頁面",
    photo: "erooms-photo",
    status: "位於赤峰街人潮核心，約 10-19 坪，純白牆面與軌道燈配置。",
    fit: "官方周邊快閃店、大型應援攝影展。",
    action: "導流至 e.rooms 官方預約頁面",
    linkLabel: "官方預約頁面",
    url: "#",
    tags: ["快閃店", "純白牆", "軌道燈", "攝影展"],
  },
  {
    name: "PLATBUM",
    meta: "中山站旁｜專輯店與期間限定展示",
    photo: "platbum-photo",
    status: "主要販售數位與實體專輯，二樓設有展示與拆專區，經常與韓國官方連動。",
    fit: "購買專輯、官方特典活動、回歸期間主題佈置。",
    action: "導流至 PLATBUM 官方 Instagram",
    linkLabel: "官方 Instagram",
    url: "#",
    tags: ["專輯", "特典", "拆專區", "官方連動"],
  },
  {
    name: "SPACECO",
    meta: "中山國小 / 松江南京｜高速網路獨立空間",
    photo: "spaceco-photo",
    status: "中山區設有中山國小館與松江南京館，獨立會議室提供商用級高速 Wi-Fi 與 4K 螢幕。",
    fit: "需要安靜環境與穩定網路的視訊簽售。",
    action: "導流至 SPACECO 官方網站",
    linkLabel: "官方網站",
    url: "#",
    tags: ["高速 Wi-Fi", "4K 螢幕", "獨立會議室", "視訊簽售"],
  },
  {
    name: "小樹屋 Treerful",
    meta: "南京西路 / 民生東路｜自助租借小型包廂",
    photo: "treerful-photo",
    status: "中山周邊據點多，部分館別有精緻小型包廂，適合預算有限但需要獨立空間的粉絲。",
    fit: "視訊簽售、個人應援直播、安靜包廂需求。",
    action: "導流至小樹屋官方網站",
    linkLabel: "官方網站",
    url: "#",
    tags: ["自助租借", "小型包廂", "預算友善", "獨立空間"],
  },
  {
    name: "愛豆應援咖啡",
    meta: "中山區｜常態性應援咖啡廳",
    photo: "idol-photo",
    status: "中山區老牌生咖店，與國內外粉絲站合作經驗豐富。",
    fit: "生日應援、杯套活動、粉絲站合作。",
    action: "導流至官方 Instagram",
    linkLabel: "官方 Instagram",
    url: "#",
    tags: ["生咖", "杯套", "粉絲站", "生日應援"],
  },
  {
    name: "K-MONSTAR",
    meta: "赤峰街｜韓團官方周邊實體據點",
    photo: "kmon-photo",
    status: "位於赤峰街，是韓團官方周邊在台的重要實體據點。",
    fit: "回歸期買周邊、官方周邊導流、主題活動。",
    action: "導流至 K-MONSTAR 官方網站",
    linkLabel: "官方網站",
    url: "#",
    tags: ["韓團周邊", "實體據點", "回歸期", "買周邊"],
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
