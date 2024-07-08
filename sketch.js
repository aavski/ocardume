let grid = [];
let gridSize;
let totalImages = 216;
let displayedImages;
let tileSize;
let imageUrls = [];
let displayedImageUrls = new Set();
let draggedTile = null;
let draggedTileIndex = {i: -1, j: -1};
let alphaValues = [];
let isDragging = false;

function preload() {
  for (let i = 0; i < totalImages; i++) {
    imageUrls.push('assets/images/tile' + i + '.jpg');
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  adjustGridSize();
  tileSize = min(width, height) / gridSize;
  background(255);
  initGrid();
  initAlphaValues();
  drawGrid();
}

function adjustGridSize() {
  if (windowWidth < 600) {
    gridSize = 3;
    displayedImages = 9;
  } else {
    gridSize = 4;
    displayedImages = 16;
  }
}

function initGrid() {
  let totalTiles = gridSize * gridSize;
  let blankTiles = floor(totalTiles * 0.2);

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
      imageIndexes.push(-1);
    } else if (i < blankTiles + displayedImages) {
      imageIndexes.push(i - blankTiles);
    } else {
      imageIndexes.push(-1);
    }
  }
  shuffle(imageIndexes, true);

  let k = 0;
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      let idx = imageIndexes[k++];
      if (idx != -1) {
        grid[i][j] = loadImage(selectedImages[idx], img => {
          grid[i][j] = img;
          drawGrid();
        }, err => {
          console.error('Failed to load image: ' + selectedImages[idx]);
          grid[i][j] = null;
          drawGrid();
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
  clear();
  background(255);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = j * tileSize;
      let y = i * tileSize;
      if (grid[i][j]) {
        image(grid[i][j], x, y, tileSize, tileSize);
      } else {
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
      displayedImageUrls.delete(draggedTile.url);
      grid[i][j] = null;
      drawGrid();
    } else {
      let newImageUrl;
      do {
        let newImageIndex = floor(random(totalImages));
        newImageUrl = imageUrls[newImageIndex];
      } while (displayedImageUrls.has(newImageUrl));
      loadImage(newImageUrl, img => {
        grid[i][j] = img;
        img.url = newImageUrl;
        displayedImageUrls.add(newImageUrl);
        drawGrid();
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
      displayedImageUrls.add(draggedTile.url);
    } else {
      grid[draggedTileIndex.i][draggedTileIndex.j] = draggedTile;
      displayedImageUrls.add(draggedTile.url);
    }
    draggedTile = null;
    drawGrid();
  } else if (draggedTile) {
    grid[draggedTileIndex.i][draggedTileIndex.j] = draggedTile;
    draggedTile = null;
    drawGrid();
  }
  isDragging = false;
}
