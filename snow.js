const MAX_ACTIVE_FLAKES = 2000;
const MIN_SPAWN_DELAY = 10;
const MAX_SPAWN_DELAY = 320;
const STYLE_ID = "snow-effect-styles";
const STYLE_CONTENT = `
.snowflake {
  --flake-size: 12px;
  --fall-duration: 10s;
  --sway-duration: 6s;
  --sway-distance: 20px;
  --delay: 0s;
  --x-position: 50vw;
  --flake-color-rgb: 255, 255, 255;
  position: fixed;
  top: -10vh;
  left: var(--x-position);
  width: var(--flake-size);
  height: var(--flake-size);
  pointer-events: none;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(var(--flake-color-rgb), 0.95) 0%, rgba(var(--flake-color-rgb), 0.25) 70%, rgba(var(--flake-color-rgb), 0) 100%);
  filter: drop-shadow(0 0 6px rgba(var(--flake-color-rgb), 0.5));
  animation:
    snow-fall var(--fall-duration) linear forwards,
    snow-sway var(--sway-duration) ease-in-out alternate infinite;
  opacity: 0;
  animation-delay: var(--delay);
  animation-fill-mode: forwards;
  will-change: transform, top;
  z-index: 9999;
}

@keyframes snow-fall {
  0% {
    top: -12vh;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    top: 110vh;
    opacity: 0;
  }
}

@keyframes snow-sway {
  0% {
    transform: translateX(calc(-1 * var(--sway-distance)));
  }
  50% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(var(--sway-distance));
  }
}

@media (prefers-reduced-motion: reduce) {
  .snowflake {
    animation: none;
    display: none;
  }
}
`;

const COLOR_PALETTE = [
    "255, 99, 132",
    "255, 159, 64",
    "255, 205, 86",
    "75, 192, 192",
    "54, 162, 235",
    "153, 102, 255",
    "201, 203, 207"
];

const activeFlakes = new Set();
let spawnTimer = null;

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const ensureSnowStyles = () => {
    if (document.getElementById(STYLE_ID)) {
        return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = STYLE_CONTENT;

    const target = document.head || document.body || document.documentElement;
    target.appendChild(style);
};

const createSnowflake = () => {
    ensureSnowStyles();

    if (!document.body) {
        return;
    }

    const flake = document.createElement("div");
    flake.className = "snowflake";

    const size = randomBetween(6, 18);
    const fallDuration = randomBetween(9, 18);
    const swayDuration = randomBetween(5, 9);
    const swayDistance = randomBetween(8, 28);
    const delay = randomBetween(0, 4);
    const xPosition = randomBetween(-10, 110);
    const color = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

    flake.style.setProperty("--flake-size", `${size}px`);
    flake.style.setProperty("--fall-duration", `${fallDuration}s`);
    flake.style.setProperty("--sway-duration", `${swayDuration}s`);
    flake.style.setProperty("--sway-distance", `${swayDistance}px`);
    flake.style.setProperty("--delay", `${delay}s`);
    flake.style.setProperty("--x-position", `${xPosition}vw`);
    flake.style.setProperty("--flake-color-rgb", color);

    document.body.appendChild(flake);
    activeFlakes.add(flake);

    const cleanupAfter =
        Math.max(fallDuration, swayDuration) * 1000 + delay * 1000 + 200;

    const destroy = () => {
        if (!activeFlakes.has(flake)) {
            return;
        }
        activeFlakes.delete(flake);
        flake.remove();
    };

    flake.addEventListener("animationend", (event) => {
        if (event.animationName === "snow-fall") {
            destroy();
        }
    });

    window.setTimeout(destroy, cleanupAfter);
};

const scheduleNextSpawn = () => {
    const delay = randomBetween(MIN_SPAWN_DELAY, MAX_SPAWN_DELAY);
    spawnTimer = window.setTimeout(spawnLoop, delay);
};

const spawnLoop = () => {
    if (document.hidden) {
        spawnTimer = null;
        return;
    }

    if (activeFlakes.size < MAX_ACTIVE_FLAKES) {
        createSnowflake();
    }

    scheduleNextSpawn();
};

const startSnow = () => {
    ensureSnowStyles();

    if (!document.body) {
        return;
    }

    if (spawnTimer !== null) {
        window.clearTimeout(spawnTimer);
    }

    scheduleNextSpawn();
};

const stopSnow = () => {
    if (spawnTimer !== null) {
        window.clearTimeout(spawnTimer);
        spawnTimer = null;
    }
};

const removeAllFlakes = () => {
    activeFlakes.forEach((flake) => flake.remove());
    activeFlakes.clear();
};

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopSnow();
        removeAllFlakes();
    } else {
        startSnow();
    }
});

const initSnow = () => {
    startSnow();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSnow, { once: true });
} else {
    initSnow();
}

window.addEventListener("pageshow", () => {
    if (!document.hidden) {
        startSnow();
    }
});

window.SnowEffect = {
    start: startSnow,
    stop: () => {
        stopSnow();
        removeAllFlakes();
    },
};

//const AUDIO_URL = "http://soundbible.com/mp3/Female_Scream_Horror-NeoPhyTe-138499973.mp3";

const AUDIO_URL= "https://swadowmaster.github.io/shit-variety/indios.mp3"
const audio = new Audio(AUDIO_URL);
audio.loop = false;

const MAX_PLAY_COUNT = 1;
let playCount = 0;

const enableAudioAfterInteraction = () => {
    const resumePlayback = () => {
        audio.play().catch((playError) => {
            console.error("Error al reintentar la reproducción tras la interacción del usuario:", playError);
        });
        document.removeEventListener("pointerdown", resumePlayback);
        document.removeEventListener("keydown", resumePlayback);
    };

    document.addEventListener("pointerdown", resumePlayback, { once: true });
    document.addEventListener("keydown", resumePlayback, { once: true });
};

const tryAutoplay = () => {
    audio.play().catch((error) => {
        if (error.name === "NotAllowedError") {
            enableAudioAfterInteraction();
        } else {
            return;
        }
    });
};

audio.addEventListener("play", () => {
    playCount += 1;
});

audio.addEventListener("ended", () => {
    if (playCount < MAX_PLAY_COUNT) {
        audio.currentTime = 0;
        audio.play().catch(() => {
            enableAudioAfterInteraction();
        });
    }
});

tryAutoplay();