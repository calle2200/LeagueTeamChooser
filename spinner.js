const playerList = document.getElementById("playerList");
const selectedPlayersDiv = document.getElementById("selectedPlayers");
const selectedCountEl = document.getElementById("selectedCount");
const errorDisplay = document.getElementById("error");

const setupSection = document.getElementById("setup");
const gameSection = document.getElementById("gameSection");
const carouselContainer = document.getElementById("carouselContainer");
const rollBtn = document.getElementById("rollBtn");
const resetBtn = document.getElementById("resetBtn");
const carousel = document.getElementById("carousel");

const team1 = document.getElementById("team1");
const team2 = document.getElementById("team2");

let selectedPlayers = [];
let availableItems = [];
let round = 0;
let usedRolesTeam1 = new Set();
let usedRolesTeam2 = new Set();

// 🔹 Läs in valda spelare från localStorage
const storedPlayers = localStorage.getItem("selectedPlayers");
if (storedPlayers) {
  selectedPlayers = JSON.parse(storedPlayers);
  availableItems = [...selectedPlayers];
  renderCarousel();

  localStorage.removeItem("selectedPlayers");
}


function updatePlayerStatusUI(name, isSelected) {
  const statusEl = document.querySelector(`.player-list-item[data-name="${name}"] .status`);
  if (statusEl) {
    statusEl.textContent = isSelected ? "In Game" : "Offline";
    statusEl.classList.toggle("in-game", isSelected);
    statusEl.classList.toggle("offline", !isSelected);
  }
}

allPlayers.forEach(player => {
  const card = document.createElement("div");
  card.className = "player-list-item";
  card.setAttribute("data-name", player.name);
  card.innerHTML = `
    <img src="${player.img}" alt="${player.name}" class="list-player-img">
    <div class="player-info">
      <span class="player-name">${player.name}</span>
      <span class="status offline">Offline</span>
    </div>
  `;
  card.addEventListener("click", () => {
    if (selectedPlayers.length >= 10) {
      errorDisplay.textContent = "Du kan bara välja 10 spelare.";
      return;
    }
    if (selectedPlayers.find(p => p.name === player.name)) return;

    selectedPlayers.push(player);
    addPlayerCard(player);
    updatePlayerStatusUI(player.name, true);
    updateSelectedCount();
  });

  playerList.appendChild(card);
});

function addPlayerCard(player) {
  const placeholders = document.querySelectorAll(".placeholder");
  const index = selectedPlayers.length - 1;

  if (index < placeholders.length) {
    const slot = placeholders[index];
    slot.classList.add("filled"); // 💡 Lägg till glow
    slot.innerHTML = `
      <img src="${player.img}" alt="${player.name}" class="player-img clickable">
      <span class="player-name">${player.name}</span>
    `;
    slot.querySelector(".player-img").addEventListener("click", () => {
      removePlayerCard(player.name);
    });
  }
}

function removePlayerCard(name) {
  const index = selectedPlayers.findIndex(p => p.name === name);
  if (index !== -1) {
    selectedPlayers.splice(index, 1);

    const placeholders = document.querySelectorAll(".placeholder");

    placeholders.forEach(ph => {
      ph.innerHTML = "";
      ph.classList.remove("filled");
    });

    selectedPlayers.forEach((player, i) => {
      placeholders[i].innerHTML = `
        <img src="${player.img}" alt="${player.name}" class="player-img clickable">
        <span class="player-name">${player.name}</span>
      `;
      placeholders[i].classList.add("filled");

      placeholders[i].querySelector(".player-img").addEventListener("click", () => {
        removePlayerCard(player.name);
      });
    });

    updatePlayerStatusUI(name, false);
    updateSelectedCount();
  }
}


function updateSelectedCount() {
  selectedCountEl.textContent = selectedPlayers.length;
  errorDisplay.textContent = "";
}

function getAvailableRole(usedRoles) {
  const available = roleImages.filter(r => !usedRoles.has(r.role));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function createPlayerElement(player) {
  const el = document.createElement("div");
  el.className = "item";
  el.innerHTML = `<img src="${player.img}" alt="${player.name}" /><span>${player.name}</span>`;
  return el;
}

function renderCarousel() {
  carousel.innerHTML = "";
  for (let i = 0; i < 3 * availableItems.length; i++) {
    const player = availableItems[i % availableItems.length];
    const item = createPlayerElement(player);
    carousel.appendChild(item);
  }
}


function startGame() {
  if (selectedPlayers.length !== 10) {
    errorDisplay.textContent = "Du måste välja exakt 10 spelare!";
    return;
  }

  localStorage.setItem("selectedPlayers", JSON.stringify(selectedPlayers));

  window.location.href = "spinner.html";

  availableItems = [...selectedPlayers];

  renderCarousel();
}

function roll() {
  if (availableItems.length === 0) {
    alert("Alla spelare har delats ut!");
    return;
  }

  rollBtn.disabled = true;

  const isSecondLastSpin = availableItems.length === 2;

  carousel.style.transition = "none";
  carousel.style.transform = `translateX(0px)`;

  setTimeout(() => {
    const itemWidth = 100;
    const itemsPerLoop = availableItems.length;
    const baseIndex = itemsPerLoop + Math.floor(Math.random() * itemsPerLoop);
    const offset = (baseIndex - 1) * itemWidth;


    carousel.style.transition = "transform 3s cubic-bezier(0.22, 1, 0.36, 1)";
    carousel.style.transform = `translateX(-${offset}px)`;

    setTimeout(() => {
      const selected = availableItems[baseIndex % itemsPerLoop];
      const currentTeam = round % 2 === 0 ? team1 : team2;
      const usedRoles = round % 2 === 0 ? usedRolesTeam1 : usedRolesTeam2;

      const role = getAvailableRole(usedRoles);
      usedRoles.add(role.role);
      playFitSound(selected, role.role);

      const placeholders = currentTeam.querySelectorAll(".teamPlaceholder");
      for (let ph of placeholders) {
        if (!ph.classList.contains("filled")) {
          ph.innerHTML = `
  <img src="${selected.img}" class="player-img" alt="${selected.name}">
`;

          ph.classList.add("filled");
          const playerNameSpan = ph.parentElement.querySelector('.player-name');
if (playerNameSpan) {
  playerNameSpan.textContent = selected.name;
}
          break;
        }
      }


      let message = ` ${selected.name} går till ${round % 2 === 0 ? "Lag 1" : "Lag 2"} som ${role.role}!`;
      availableItems = availableItems.filter(p => p.name !== selected.name);
      round++;

      if (isSecondLastSpin && availableItems.length === 1) {
        const remaining = availableItems[0];
        const otherTeam = round % 2 === 0 ? team1 : team2;
        const otherRoles = round % 2 === 0 ? usedRolesTeam1 : usedRolesTeam2;
        const autoRole = getAvailableRole(otherRoles);
        otherRoles.add(autoRole.role);
        playFitSound(remaining, autoRole.role);

        const otherPlaceholders = otherTeam.querySelectorAll(".teamPlaceholder");
        for (let ph of otherPlaceholders) {
          if (!ph.classList.contains("filled")) {
            ph.innerHTML = `
  <img src="${remaining.img}" class="player-img" alt="${remaining.name}">
`;

            ph.classList.add("filled");
            const playerNameSpan = ph.parentElement.querySelector('.player-name');
if (playerNameSpan) {
  playerNameSpan.textContent = remaining.name;
}
            break;
          }
        }


        message += `\n🪄 ${remaining.name} går automatiskt till ${round % 2 === 0 ? "Lag 1" : "Lag 2"} som ${autoRole.role}!`;
        availableItems = [];
        round++;
      }


      renderCarousel();
      rollBtn.disabled = false;
    }, 3100);
  }, 50);
}

function playFitSound(player, roleName) {
  const fit = player.roleFit?.[roleName] || "ok";
  const sound = new Audio(`sounds/${fit}.mp3`);
  sound.volume = 0.6;
  sound.play();
}

function resetGame() {

  window.location.href = "choose.html";
  round = 0;
  usedRolesTeam1.clear();
  usedRolesTeam2.clear();
  availableItems = [];
  selectedPlayers = [];

  team1.innerHTML = "<h3>Lag 1</h3>";
  team2.innerHTML = "<h3>Lag 2</h3>";
  carousel.innerHTML = "";

  setupSection.classList.remove("hidden");
  gameSection.classList.add("hidden");
  carouselContainer.classList.add("hidden");
  rollBtn.classList.add("hidden");
  resetBtn.classList.add("hidden");


  document.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);

  // Töm och återställ alla placeholders
  const placeholders = document.querySelectorAll(".placeholder");
  placeholders.forEach(ph => {
    ph.innerHTML = "";
    ph.classList.remove("filled");
  });

  // Du behöver inte tömma selectedPlayersDiv om du inte lägger något där
  // selectedPlayersDiv.innerHTML = ""; // Kan tas bort

  updateSelectedCount();

  allPlayers.forEach(p => updatePlayerStatusUI(p.name, false));

}
