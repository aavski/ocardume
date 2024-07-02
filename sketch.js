let grid = [];
let gridSize = 4; // Size of the grid (e.g., 4x4)
let totalImages = 216; // Total number of images available
let displayedImages = 20; // Number of images to display at once
let tileSize;
let imageUrls = [];
let displayedImageUrls = new Set(); // Track displayed images
let draggedTile = null;
let draggedTileIndex = {i: -1, j: -1};
let fadeDuration = 60; // Duration for fade effect in frames
let alphaValues = []; // Store alpha values for fade effect
let isDragging = false;

function preload() {
  // Preload image URLs
  for (let i = 0; i < totalImages; i++) {
    imageUrls.push(`https://ocardu.me/wp-content/uploads/GRID/SMALL/tile${i}.jpg`);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  tileSize = min(width, height) / gridSize;
  background(255); // Set background to white
  initGrid();
  initAlphaValues();
  drawGrid();
}

function initGrid() {
  // Calculate the number of blank tiles
  let totalTiles = gridSize * gridSize;
  let blankTiles = floor(totalTiles * 0.2); // 20% blank tiles

  // Select random images for the grid
  let selectedImages = [];
  while (selectedImages.length < displayedImages) {
    let index = floor(random(totalImages));
    let imageUrl = imageUrls[index];
    if (!displayedImageUrls.has(imageUrl)) {
      selectedImages.push(imageUrl);
      displayedImageUrls.add(imageUrl);
    }
  }

  let imageIndexes = [];
  for (let i = 0; i < totalTiles; i++) {
    if (i < blankTiles) {
      imageIndexes.push(-1); // Empty tile
    } else if (i < blankTiles + displayedImages) {
      imageIndexes.push(i - blankTiles);
    } else {
      imageIndexes.push(-1); // Extra empty tiles
    }
  }
  shuffle(imageIndexes, true); // Shuffle the array to randomize grid

  let k = 0;
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      let idx = imageIndexes[k++];
      if (idx != -1) {
        // Load image dynamically with error handling
        grid[i][j] = loadImage(selectedImages[idx], img => {
          grid[i][j] = img;
          drawGrid(); // Redraw grid after each image is loaded
        }, err => {
          console.error(`Failed to load image: ${selectedImages[idx]}`);
          grid[i][j] = null;
          drawGrid(); // Redraw grid to show empty tile
        });
      } else {
        grid[i][j] = null;
      }
    }
  }
}

function initAlphaValues() {
  alphaValues = [];
  for (let i = 0; i < gridSize; i++) {
    alphaValues[i] = [];
    for (let j = 0; j < gridSize; j++) {
      alphaValues[i][j] = 255;
    }
  }
}

function drawGrid() {
  clear(); // Clear the canvas before drawing
  background(255); // Set background to white
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = j * tileSize;
      let y = i * tileSize;
      if (grid[i][j]) {
        tint(255, alphaValues[i][j]);
        image(grid[i][j], x, y, tileSize, tileSize);
        noTint();
      } else {
        // Draw empty space
        fill(255);
        noStroke();
        rect(x, y, tileSize, tileSize);
      }
    }
  }
}

function mousePressed() {
  isDragging = false;
  let i = floor(mouseY / tileSize);
  let j = floor(mouseX / tileSize);
  if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
    if (grid[i][j]) {
      draggedTile = grid[i][j];
      draggedTileIndex = {i, j};
      displayedImageUrls.delete(draggedTile.url); // Remove the image from the set
      grid[i][j] = null; // Make the original tile blank while dragging
      drawGrid();
    } else {
      let newImageUrl;
      do {
        let newImageIndex = floor(random(totalImages));
        newImageUrl = imageUrls[newImageIndex];
      } while (displayedImageUrls.has(newImageUrl)); // Ensure the image is not already displayed

      loadImage(newImageUrl, img => {
        grid[i][j] = img;
        img.url = newImageUrl; // Store the image URL in the image object
        displayedImageUrls.add(newImageUrl);
        startFadeIn(i, j); // Start fade in animation
      });
    }
  }
}

function mouseDragged() {
  if (draggedTile) {
    isDragging = true;
    clear();
    background(255);
    drawGrid();
    image(draggedTile, mouseX - tileSize / 2, mouseY - tileSize / 2, tileSize, tileSize);
  }
}

function mouseReleased() {
  if (isDragging && draggedTile) {
    let i = floor(mouseY / tileSize);
    let j = floor(mouseX / tileSize);
    if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
      let swapTile = grid[i][j];
      grid[i][j] = draggedTile;
      grid[draggedTileIndex.i][draggedTileIndex.j] = swapTile;
      displayedImageUrls.add(draggedTile.url); // Add the dragged tile's URL back to the set
    } else {
      grid[draggedTileIndex.i][draggedTileIndex.j] = draggedTile;
      displayedImageUrls.add(draggedTile.url); // Add the dragged tile's URL back to the set
    }
    draggedTile = null;
    drawGrid();
  } else if (draggedTile) {
    startFadeOut(draggedTileIndex.i, draggedTileIndex.j);
    draggedTile = null;
  }
  isDragging = false;
}

function startFadeOut(i, j) {
  let fadeOutInterval = setInterval(() => {
    alphaValues[i][j] -= 255 / fadeDuration;
    if (alphaValues[i][j] <= 0) {
      clearInterval(fadeOutInterval);
      grid[i][j] = null;
      alphaValues[i][j] = 255;
      drawGrid();
    } else {
      drawGrid();
    }
  }, 1000 / 60); // Approx. 60 frames per second
}

function startFadeIn(i, j) {
  alphaValues[i][j] = 0;
  let fadeInInterval = setInterval(() => {
    alphaValues[i][j] += 255 / fadeDuration;
    if (alphaValues[i][j] >= 255) {
      clearInterval(fadeInInterval);
      alphaValues[i][j] = 255;
      drawGrid();
    } else {
      drawGrid();
    }
  }, 1000 / 60); // Approx. 60 frames per second
}
