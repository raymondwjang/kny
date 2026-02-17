// Edit these two values:
const ZODIAC = "horse 🐴";
const FAMILY = "엄마❤️";

// List your family photos here (add/remove as needed):
const PHOTOS = [
    "./assets/img/family-01.jpg",
    "./assets/img/family-02.jpg",
    "./assets/img/family-03.jpg",
    "./assets/img/family-04.jpg",
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
    const stageRect = launcher.getBoundingClientRect();

    // origin near the pouch opening
    const originX = (btnRect.left + btnRect.right) / 2 - stageRect.left;
    const originY = (btnRect.top + btnRect.top + 90) / 2 - stageRect.top; // slightly below top of button

    return { x: originX, y: originY };
}

let photoIndex = 0;

function pickPhoto() {
    if (PHOTOS.length === 0) return null;
    const src = PHOTOS[photoIndex % PHOTOS.length];
    photoIndex += 1;
    return src;
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
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
    const angle = rand(-Math.PI * 0.75, -Math.PI * 0.25); // upwards arc
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
        card.style.left = `${settleX}px`;
        card.style.top = `${settleY}px`;
        card.style.opacity = "1";
        card.style.transform = `translate(-50%, -50%) rotate(${endRot}deg)`;

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
    for (let i = 0; i < burst; i++) {
        setTimeout(launchPhoto, i * 90);
    }
});
