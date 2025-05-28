const allPlayers = [
      { name: "FatNeek", img: "images/icons/alistar.jpg" },
      { name: "Dedona", img: "images/icons/icon.png" },
      { name: "Stahlet", img: "images/icons/ezreal.png" },
      { name: "Simpa", img: "images/icons/sylas.webp" },
      { name: "LolSpelare", img: "images/icons/yone.jpg" },
      { name: "Skalander", img: "images/icons/voli.jpg" },
      { name: "Luigi", img: "images/icons/sion.webp" },
      { name: "2Camel", img: "images/icons/rammus.jpg" },
      { name: "Moses", img: "images/icons/icon.png" },
      { name: "Pelle", img: "images/icons/icon.png" },
      { name: "Rez", img: "images/icons/icon.png" },
      { name: "Lampskaerm", img: "images/icons/icon.png" },
      { name: "Daddyshooker", img: "images/icons/icon.png" },
      { name: "Fnorkos", img: "images/icons/icon.png" },
      { name: "Saedobity", img: "images/icons/icon.png" },
      { name: "Guest1", img: "images/icons/icon.png" },
      { name: "Guest2", img: "images/icons/icon.png" },
      { name: "Guest3", img: "images/icons/icon.png" },
      { name: "Guest4", img: "images/icons/icon.png" },
      { name: "Guest5", img: "images/icons/icon.png" }
    ];

    const roleImages = [
      { role: "Toplane", img: "images/lanes/toplane.png" },
      { role: "Jungle", img: "images/lanes/jungle.png" },
      { role: "Midlane", img: "images/lanes/midlane.png" },
      { role: "Botlane", img: "images/lanes/botlane.png" },
      { role: "Support", img: "images/lanes/support.png" }
    ];

    const playerList = document.getElementById("playerList");
    const setupSection = document.getElementById("setup");
    const gameSection = document.getElementById("gameSection");
    const carouselContainer = document.getElementById("carouselContainer");
    const rollBtn = document.getElementById("rollBtn");
    const errorDisplay = document.getElementById("error");
    const selectedCountEl = document.getElementById("selectedCount");

    // Populate checkboxes
    allPlayers.forEach((player, index) => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" value="${index}" /> ${player.name}`;
      label.querySelector("input").addEventListener("change", updateSelectedCount);
      playerList.appendChild(label);
    });

    function updateSelectedCount() {
      const count = document.querySelectorAll("input[type='checkbox']:checked").length;
      selectedCountEl.textContent = count;
    }

    let availableItems = [];
    let round = 0;
    let usedRolesTeam1 = new Set();
    let usedRolesTeam2 = new Set();

    const carousel = document.getElementById("carousel");
    const popup = document.getElementById("popup");
    const team1 = document.getElementById("team1");
    const team2 = document.getElementById("team2");

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
      const selected = [...document.querySelectorAll("input[type='checkbox']:checked")].map(cb => allPlayers[cb.value]);
      if (selected.length !== 10) {
        errorDisplay.textContent = "Du måste välja exakt 10 spelare!";
        return;
      }

      availableItems = selected;
      setupSection.classList.add("hidden");
      gameSection.classList.remove("hidden");
      carouselContainer.classList.remove("hidden");
      rollBtn.classList.remove("hidden");
      resetBtn.classList.remove("hidden");
      renderCarousel();
    }

    function roll() {
      if (availableItems.length === 0) {
        alert("Alla spelare har delats ut!");
        return;
      }

      const isSecondLastSpin = availableItems.length === 2;
      popup.style.display = "none";
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

          const newDiv = document.createElement("div");
          newDiv.className = "team-player";
          newDiv.innerHTML = `
            <img src="${selected.img}" class="player-img" alt="${selected.name}">
            <span>${selected.name}</span>
            <img src="${role.img}" class="role-img" title="${role.role}">
            <span>${role.role}</span>
          `;
          currentTeam.appendChild(newDiv);

          let message = `🎉 ${selected.name} går till ${round % 2 === 0 ? "Lag 1" : "Lag 2"} som ${role.role}!`;
          availableItems = availableItems.filter(p => p.name !== selected.name);
          round++;

          if (isSecondLastSpin && availableItems.length === 1) {
            const remaining = availableItems[0];
            const otherTeam = round % 2 === 0 ? team1 : team2;
            const otherRoles = round % 2 === 0 ? usedRolesTeam1 : usedRolesTeam2;
            const autoRole = getAvailableRole(otherRoles);
            otherRoles.add(autoRole.role);

            const autoDiv = document.createElement("div");
            autoDiv.className = "team-player";
            autoDiv.innerHTML = `
              <img src="${remaining.img}" class="player-img" alt="${remaining.name}">
              <span>${remaining.name}</span>
              <img src="${autoRole.img}" class="role-img" title="${autoRole.role}">
              <span>${autoRole.role}</span>
            `;
            otherTeam.appendChild(autoDiv);

            message += `\n🪄 ${remaining.name} går automatiskt till ${round % 2 === 0 ? "Lag 1" : "Lag 2"} som ${autoRole.role}!`;
            availableItems = [];
            round++;
          }

          popup.textContent = message;
          popup.style.display = "block";
          renderCarousel();
        }, 3100);
      }, 50);
    }

    function resetGame() {
    // Nollställ all logik och UI
    round = 0;
    usedRolesTeam1.clear();
    usedRolesTeam2.clear();
    availableItems = [];

    // Töm lag
    team1.innerHTML = "<h3>Lag 1</h3>";
    team2.innerHTML = "<h3>Lag 2</h3>";

    // Töm rullband
    carousel.innerHTML = "";

    // Visa setup-sektionen
    setupSection.classList.remove("hidden");

    // Dölj spelet
    gameSection.classList.add("hidden");
    carouselContainer.classList.add("hidden");
    rollBtn.classList.add("hidden");
    resetBtn.classList.add("hidden");

    // Återställ popup
    popup.style.display = "none";

    // Avmarkera alla checkboxes
    document.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
}