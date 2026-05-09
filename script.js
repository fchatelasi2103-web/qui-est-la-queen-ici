let players = [];

const QUESTIONS = [
  "Qui arrive toujours en retard ? ⏰",
  "Qui répond le plus tard ? 📱",
  "Qui ghoste le plus ? 👻",
  "Qui ferait de la télé-réalité ? 📺",
  "Qui ferait le pire karaoké ? 🎤",
  "Qui est la plus bordélique ? 🧹"
];

const state = {
  secretIndex: null
};

function savePlayers() {

  localStorage.setItem(
    "queen_players",
    JSON.stringify(players)
  );
}

function loadPlayers() {

  const saved =
    localStorage.getItem("queen_players");

  if (saved) {

    players = JSON.parse(saved);

  } else {

    players = [];
  }
}

function avatar(player) {

  if (player.photo) {

    return `
      <img src="${player.photo}" alt="">
    `;
  }

  return "👑";
}

function showScreen(id) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {
      screen.classList.remove("active");
    });

  document
    .getElementById(id)
    .classList.add("active");
}

function buildCards() {

  const grid =
    document.getElementById("cards-grid");

  grid.innerHTML = "";

  players.forEach((player) => {

    const card =
      document.createElement("div");

    card.className = "player-card";

    card.innerHTML = `
      <div class="avatar">
        ${avatar(player)}
      </div>

      <div class="name">
        ${player.name}
      </div>
    `;

    card.addEventListener("click", () => {
      card.classList.toggle("eliminated");
    });

    grid.appendChild(card);
  });
}

function pickSecret() {

  state.secretIndex =
    Math.floor(Math.random() * players.length);
}

function startGame() {

  if (players.length < 2) {

    alert(
      "Ajoute au moins 2 joueuses 👀"
    );

    return;
  }

  pickSecret();

  const player =
    players[state.secretIndex];

  document.getElementById(
    "secret-avatar"
  ).innerHTML = avatar(player);

  document.getElementById(
    "secret-name"
  ).textContent = player.name;

  document.getElementById(
    "secret-anecdote"
  ).textContent =
    player.anecdote || "";

  buildCards();

  showScreen("screen-secret");
}

function randomQuestion() {

  const question =
    QUESTIONS[
      Math.floor(
        Math.random() * QUESTIONS.length
      )
    ];

  document.getElementById(
    "question-text"
  ).textContent = question;
}

function openGuessModal() {

  const grid =
    document.getElementById("guess-grid");

  grid.innerHTML = "";

  players.forEach((player, index) => {

    const item =
      document.createElement("div");

    item.className = "guess-item";

    item.innerHTML = `
      <div class="avatar small">
        ${avatar(player)}
      </div>

      <div class="name">
        ${player.name}
      </div>
    `;

    item.addEventListener("click", () => {

      if (index === state.secretIndex) {

        document.getElementById(
          "win-avatar"
        ).innerHTML = avatar(player);

        document.getElementById(
          "win-name"
        ).textContent = player.name;

        showScreen("screen-win");

      } else {

        const real =
          players[state.secretIndex];

        document.getElementById(
          "lose-avatar"
        ).innerHTML = avatar(real);

        document.getElementById(
          "lose-name"
        ).textContent = real.name;

        showScreen("screen-lose");
      }

      closeGuessModal();
    });

    grid.appendChild(item);
  });

  document
    .getElementById("modal-guess")
    .classList.remove("hidden");
}

function closeGuessModal() {

  document
    .getElementById("modal-guess")
    .classList.add("hidden");
}

function showToast(text) {

  const toast =
    document.getElementById("toast");

  toast.textContent = text;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 2000);
}

function renderPlayers() {

  const list =
    document.getElementById("players-list");

  list.innerHTML = "";

  players.forEach((player, index) => {

    const card =
      document.createElement("div");

    card.className = "manage-card";

    card.innerHTML = `
      <div class="avatar">
        ${avatar(player)}
      </div>

      <div class="manage-info">

        <div class="manage-name">
          ${player.name}
        </div>

        <div class="manage-anecdote">
          ${player.anecdote || ""}
        </div>

      </div>

      <button class="delete-btn">
        ✕
      </button>
    `;

    card.addEventListener("click", () => {
      openEdit(index);
    });

    const deleteBtn =
      card.querySelector(".delete-btn");

    deleteBtn.addEventListener(
      "click",
      (e) => {

        e.stopPropagation();

        const confirmDelete =
          confirm(
            `Supprimer ${player.name} ?`
          );

        if (!confirmDelete) return;

        players.splice(index, 1);

        savePlayers();

        renderPlayers();

        showToast("Supprimée 🗑️");
      }
    );

    list.appendChild(card);
  });
}

let editingIndex = null;
let currentPhoto = null;

function openAdd() {

  editingIndex = null;

  currentPhoto = null;

  document.getElementById(
    "form-title"
  ).textContent =
    "Ajouter une joueuse";

  document.getElementById(
    "input-name"
  ).value = "";

  document.getElementById(
    "input-anecdote"
  ).value = "";

  document.getElementById(
    "photo-preview"
  ).innerHTML = "";

  document
    .getElementById("modal-form")
    .classList.remove("hidden");
}

function openEdit(index) {

  editingIndex = index;

  const player = players[index];

  currentPhoto = player.photo;

  document.getElementById(
    "form-title"
  ).textContent =
    "Modifier";

  document.getElementById(
    "input-name"
  ).value = player.name;

  document.getElementById(
    "input-anecdote"
  ).value =
    player.anecdote || "";

  document.getElementById(
    "photo-preview"
  ).innerHTML =
    player.photo
      ? `<img src="${player.photo}">`
      : "";

  document
    .getElementById("modal-form")
    .classList.remove("hidden");
}

function closeForm() {

  document
    .getElementById("modal-form")
    .classList.add("hidden");
}

function savePlayer() {

  const name =
    document
      .getElementById("input-name")
      .value
      .trim();

  const anecdote =
    document
      .getElementById("input-anecdote")
      .value
      .trim();

  if (!name) {

    alert(
      "Ajoute un prénom 👀"
    );

    return;
  }

  const player = {
    name,
    anecdote,
    photo: currentPhoto
  };

  if (editingIndex !== null) {

    players[editingIndex] = player;

  } else {

    players.push(player);
  }

  savePlayers();

  renderPlayers();

  closeForm();

  showToast("Sauvegardée ✅");
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadPlayers();

    renderPlayers();

    document
      .getElementById("btn-start")
      .addEventListener(
        "click",
        startGame
      );

    document
      .getElementById("btn-secret-ok")
      .addEventListener(
        "click",
        () => {
          showScreen("screen-game");
        }
      );

    document
      .getElementById("btn-home")
      .addEventListener(
        "click",
        () => {
          showScreen("screen-home");
        }
      );

    document
      .getElementById("btn-question")
      .addEventListener(
        "click",
        randomQuestion
      );

    document
      .getElementById("btn-guess")
      .addEventListener(
        "click",
        openGuessModal
      );

    document
      .getElementById("btn-manage")
      .addEventListener(
        "click",
        () => {

          renderPlayers();

          document
            .getElementById("modal-players")
            .classList.remove("hidden");
        }
      );

    document
      .getElementById("btn-close-players")
      .addEventListener(
        "click",
        () => {

          document
            .getElementById("modal-players")
            .classList.add("hidden");
        }
      );

    document
      .getElementById("btn-add-player")
      .addEventListener(
        "click",
        openAdd
      );

    document
      .getElementById("btn-cancel-player")
      .addEventListener(
        "click",
        closeForm
      );

    document
      .getElementById("btn-save-player")
      .addEventListener(
        "click",
        savePlayer
      );

    document
      .getElementById("btn-photo")
      .addEventListener(
        "click",
        () => {

          document
            .getElementById("input-photo")
            .click();
        }
      );

    // IMPORTANT
    // GALERIE + CAMERA
    // ET sauvegarde base64 persistante

    document
      .getElementById("input-photo")
      .addEventListener(
        "change",
        (e) => {

          const file =
            e.target.files[0];

          if (!file) return;

          const reader =
            new FileReader();

          reader.onload = (event) => {

            currentPhoto =
              event.target.result;

            document.getElementById(
              "photo-preview"
            ).innerHTML = `
              <img src="${currentPhoto}">
            `;
          };

          reader.readAsDataURL(file);
        }
      );

    document
      .getElementById("btn-replay")
      .addEventListener(
        "click",
        () => {
          showScreen("screen-home");
        }
      );

    document
      .getElementById("btn-replay2")
      .addEventListener(
        "click",
        () => {
          showScreen("screen-home");
        }
      );
  }
);
