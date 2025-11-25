//your code here
// ---------- INITIAL ELEMENTS ----------
const tiles = document.querySelectorAll("div");   // 6 image divs containing background-image
const resetBtn = document.getElementById("reset");
const verifyBtn = document.getElementById("verify");
const heading = document.getElementById("h");
const para = document.getElementById("para");

// ---------- GAME VARIABLES ----------
let selected = []; // store clicked tiles
let images = ["img1", "img2", "img3", "img4", "img5"]; // 5 unique classes

// ---------- STEP 1: RANDOMIZE IMAGES ----------
function randomizeImages() {
    // Pick 1 random image to duplicate
    const duplicate = images[Math.floor(Math.random() * images.length)];

    // Create an array of 6: 5 unique + 1 duplicate
    let finalImages = [...images, duplicate];

    // Shuffle the images
    finalImages.sort(() => Math.random() - 0.5);

    // Apply shuffled images to tiles
    tiles.forEach((tile, i) => {
        tile.className = "";       // remove previous class
        tile.classList.add(finalImages[i]); // add new class (img1,img2...)
        tile.dataset.name = finalImages[i]; // store identity
    });

    // Reset UI
    resetBtn.style.display = "none";
    verifyBtn.style.display = "none";
    para.textContent = "";
    heading.textContent = "Please click on the identical tiles to verify that you are not a robot.";
    selected = [];
}

randomizeImages();

// ---------- TILE CLICK HANDLER ----------
tiles.forEach(tile => {
    tile.addEventListener("click", () => {

        // prevent selecting more than 2
        if (selected.length === 2) return;

        // prevent selecting the same tile twice
        if (selected.includes(tile)) return;

        tile.style.border = "5px solid blue"; // highlight selected tile
        selected.push(tile);

        // Show reset button after first click
        if (selected.length === 1) {
            resetBtn.style.display = "block";
        }

        // After second click → show verify button
        if (selected.length === 2) {
            verifyBtn.style.display = "block";
        }
    });
});

// ---------- RESET BUTTON ----------
resetBtn.addEventListener("click", () => {
    selected.forEach(t => t.style.border = "none");
    selected = [];
    verifyBtn.style.display = "none";
    resetBtn.style.display = "none";
    para.textContent = "";
    heading.textContent = "Please click on the identical tiles to verify that you are not a robot.";
});

// ---------- VERIFY BUTTON ----------
verifyBtn.addEventListener("click", () => {
    verifyBtn.style.display = "none";

    const [imgA, imgB] = selected;

    if (imgA.dataset.name === imgB.dataset.name) {
        para.textContent = "You are a human. Congratulations!";
    } else {
        para.textContent = "We can't verify you as human. You selected non-identical tiles.";
    }
});
