// Edit these two values:
const ZODIAC = "horse 🐴";
const FAMILY = "엄마❤️";

// List your family photos here (add/remove as needed):
const PHOTOS = [
    "./assets/img/fireplace.jpg",
    "./assets/img/bday.jpg",
    "./assets/img/concert.jpg",
    "./assets/img/bow_me.png",
];

const wishZodiac = document.getElementById("zodiacYear");
const wishFamily = document.getElementById("familyName");
wishZodiac.textContent = ZODIAC;
wishFamily.textContent = FAMILY;

const pouchButton = document.getElementById("pouchButton");
const launcher = document.getElementById("launcher");

// Where should photos burst from? We'll compute from the pouch button position.
function getBurstOrigin() {
    const btnRect = pouchButton.getBoundingClientRect();
    // origin near the top third of the pouch (mouth area)
    const originX = btnRect.left + btnRect.width / 2;
    const originY = btnRect.top + btnRect.height * 0.35;
    return { x: originX, y: originY };
}

let photoIndex = 0;
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickPhoto() {
    if (PHOTOS.length === 0) return null;
    return PHOTOS[getRandomInt(0, PHOTOS.length - 1)];
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function launchSparkles(count = 10) {
    const { x, y } = getBurstOrigin();

    for (let i = 0; i < count; i++) {
        const s = document.createElement("div");
        s.className = "sparkle";
        s.style.left = `${x}px`;
        s.style.top = `${y}px`;

        launcher.appendChild(s);

        const angle = rand(0, Math.PI * 2);
        const distance = rand(120, 200);

        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        const scale = rand(0.6, 1.4);

        const anim = s.animate(
            [
                { transform: "translate(-50%, -50%) scale(0.2)", opacity: 0 },
                { transform: `translate(calc(-50% + ${dx * 0.6}px), calc(-50% + ${dy * 0.6}px)) scale(${scale})`, opacity: 1, offset: 0.4 },
                { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.2)`, opacity: 0 }
            ],
            {
                duration: rand(500, 900),
                easing: "ease-out",
                fill: "forwards",
            }
        );

        anim.onfinish = () => s.remove();
    }
}


function launchPhoto() {
    const src = pickPhoto();
    if (!src) return;

    const { x, y } = getBurstOrigin();

    const card = document.createElement("div");
    card.className = "photo";
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;

    const img = document.createElement("img");
    img.src = src;
    img.alt = "Family photo";
    img.loading = "lazy";

    card.appendChild(img);
    launcher.appendChild(card);

    // Animation parameters:
    const angle = rand(-Math.PI * 1, -Math.PI * -1); // upwards arc
    const speed = rand(520, 900); // px/s-ish
    const spin = rand(-16, 16);   // degrees end rotation
    const drift = rand(-120, 120);

    // End position (relative to origin)
    const dx = Math.cos(angle) * rand(140, 240) + drift;
    const dy = Math.sin(angle) * rand(180, 320);

    // Random settle location
    const settleX = x + dx;
    const settleY = y + dy;

    // Use Web Animations API (clean + no dependencies)
    const startRot = rand(-6, 6);
    const endRot = startRot + spin;

    const anim = card.animate(
        [
            { transform: `translate(-50%, -50%) rotate(${startRot}deg) scale(0.98)`, opacity: 0.0 },
            { transform: `translate(calc(-50% + ${dx * 0.45}px), calc(-50% + ${dy * 0.45}px)) rotate(${(startRot + endRot) / 2}deg) scale(1.02)`, opacity: 1.0, offset: 0.35 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${endRot}deg) scale(1.0)`, opacity: 1.0 }
        ],
        {
            duration: rand(700, 1050),
            easing: "cubic-bezier(.2,.9,.2,1)",
            fill: "forwards",
        }
    );

    // Keep the card where it landed; then slowly fade older ones away.
    anim.onfinish = () => {
        // card.style.left = `${settleX}px`;
        // card.style.top = `${settleY}px`;
        // card.style.opacity = "1";
        // card.style.transform = `translate(-50%, -50%) rotate(${endRot}deg)`;

        // Optional: remove after a while to avoid clutter
        setTimeout(() => {
            card.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 450,
                easing: "ease",
                fill: "forwards",
            }).onfinish = () => card.remove();
        }, 7000);
    };
}

// Click = one photo; shift-click = burst
pouchButton.addEventListener("click", (e) => {
    const burst = e.shiftKey ? 6 : 1;

    // ✨ sparkles immediately
    launchSparkles(e.shiftKey ? 24 : 12);

    for (let i = 0; i < burst; i++) {
        setTimeout(() => {
            launchPhoto();
            launchSparkles(6); // tiny trailing sparkles per photo
        }, i * 90);
    }
});
