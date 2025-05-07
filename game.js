import { PointMass } from "./pointMass.js";
import { PositionArray } from "./positionArray.js";
import { calcMass } from "./matrixVector.js";
import { getStiffness, getGravity, getDamping, getPointMassRadius, getFriction } from "./constants.js";
import { resetPositions, jump, move, impulseCalc } from "./movement.js";
import LevelManager from "./LevelManager.js";

// Import the hint system functions
import { showHint as typewriterShowHint, clearHint as typewriterClearHint } from "./typeWriterHint.js";

// --- CANVAS SETUP ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const width = canvas.width = 800;
const height = canvas.height = 600;

// --- INPUT STATE ---
export const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup",   e => keys[e.key.toLowerCase()] = false);

// --- DEFINE DEFAULT ENTITIES ---
// These will be replaced by level-specific entities
const defaultPlayers = {
  player: [
    new PointMass(300, 100, 1),
    new PointMass(300, 300, 1),
    new PointMass(100, 300, 1),
    new PointMass(100, 100, 1)
  ]
};

// Create a global reference that levels can modify
window.gameBodies = { ...defaultPlayers };

// Export required objects for compatibility with existing level code
export const bodies = window.gameBodies;

// --- STATE MAPS ---
const initialStates = {}, positions = {}, velocities = {}, accelerations = {}, springRestLengths = {}, normalForces = {}, isOnGround = {};

function initializeEntities() {
  // This function initializes state for all entities currently in gameBodies
  // Called at the start of each frame to handle any entity changes from levels
  
  const allEntities = window.gameBodies;
  const entities = Object.keys(allEntities);
  
  entities.forEach(entityName => {
    const pointMasses = allEntities[entityName];
    
    // Only initialize if not already initialized
    if (!initialStates[entityName]) {
      initialStates[entityName] = {
        positions: pointMasses.map(p => [p.x, p.y]),
        velocities: pointMasses.map(p => [p.velocity_x, p.velocity_y]),
        accelerations: pointMasses.map(p => [p.acceleration_x, p.acceleration_y])
      };
    }
    
    // Always recreate position arrays in case entities changed
    positions[entityName] = new PositionArray(...pointMasses.map(p => [p.x, p.y]));
    velocities[entityName] = new PositionArray(...pointMasses.map(p => [p.velocity_x, p.velocity_y]));
    accelerations[entityName] = new PositionArray(...pointMasses.map(p => [p.acceleration_x, p.acceleration_y]));
    
    // Recalculate spring rest lengths
    springRestLengths[entityName] = pointMasses.map((p, i) => {
      const next = pointMasses[(i + 1) % pointMasses.length];
      const dx = next.x - p.x, dy = next.y - p.y;
      return Math.hypot(dx, dy);
    });
    
    if (!normalForces[entityName]) {
      normalForces[entityName] = [];
    }
    
    if (isOnGround[entityName] === undefined) {
      isOnGround[entityName] = false;
    }
  });
}

// Fixed springConstraints function
function springConstraints(points, positionArray, velocityArray, restLengths) {
  const k = getStiffness(), c = getDamping(), g = getGravity();
  
  // Reset forces
  points.forEach(p => { p.force_x = 0; p.force_y = 0; });
  
  // Apply gravity first
  points.forEach(p => p.force_y += p.mass * g);
  
  // Apply spring forces - stable implementation
  points.forEach((p, i) => {
    const nxt = points[(i + 1) % points.length];
    
    // Current positions and lengths
    const dx = nxt.x - p.x;
    const dy = nxt.y - p.y;
    const currentLength = Math.sqrt(dx * dx + dy * dy);
    
    if (currentLength < 0.001) return;
    
    // Direction vector
    const dirX = dx / currentLength;
    const dirY = dy / currentLength;
    
    // Calculate spring force
    const restLength = restLengths[i];
    const displacement = currentLength - restLength;
    const springForce = -k * displacement;
    
    // Apply spring force
    p.force_x -= springForce * dirX;
    p.force_y -= springForce * dirY;
    nxt.force_x += springForce * dirX;
    nxt.force_y += springForce * dirY;
    
    // Calculate and apply damping
    const relVelX = nxt.velocity_x - p.velocity_x;
    const relVelY = nxt.velocity_y - p.velocity_y;
    const relVelProj = relVelX * dirX + relVelY * dirY;
    const dampingForce = -c * relVelProj;
    
    p.force_x -= dampingForce * dirX;
    p.force_y -= dampingForce * dirY;
    nxt.force_x += dampingForce * dirX;
    nxt.force_y += dampingForce * dirY;
  });
  
  // Velocity limiter for stability
  points.forEach((p, i) => {
    const MAX_VELOCITY = 1000;
    const velMag = Math.sqrt(p.velocity_x * p.velocity_x + p.velocity_y * p.velocity_y);
    
    if (velMag > MAX_VELOCITY) {
      const scale = MAX_VELOCITY / velMag;
      p.velocity_x *= scale;
      p.velocity_y *= scale;
      velocityArray.positions[i][0] = p.velocity_x;
      velocityArray.positions[i][1] = p.velocity_y;
    }
  });
}

// Helper function to add diagonal springs (for rectangular integrity)
function addDiagonalSpring(p1, p2, stiffness, damping, positionArray, velocityArray) {
  const i1 = findPointIndex(p1), i2 = findPointIndex(p2);
  
  const [x1, y1] = [p1.x, p1.y];
  const [x2, y2] = [p2.x, p2.y];
  
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < 0.001) return;
  
  // For diagonals, we use the current distance as rest length if undefined
  // This helps maintain the current shape rather than pulling in
  const diagonalRest = dist;
  
  // Diagonal springs should resist compression more than stretching
  // This prevents the shape from collapsing inward
  const disp = dist - diagonalRest;
  let effectiveK = stiffness;
  
  if (disp < 0) {
    // Compression - increase stiffness to prevent collapse
    effectiveK = stiffness * 2;
  }
  
  const fMag = effectiveK * disp;
  const dirX = dx / dist, dirY = dy / dist;
  
  // Apply spring forces
  p1.force_x += fMag * dirX;
  p1.force_y += fMag * dirY;
  p2.force_x -= fMag * dirX;
  p2.force_y -= fMag * dirY;
  
  // Apply damping
  const [vx1, vy1] = i1 !== -1 ? velocityArray.positions[i1] : [p1.velocity_x, p1.velocity_y];
  const [vx2, vy2] = i2 !== -1 ? velocityArray.positions[i2] : [p2.velocity_x, p2.velocity_y];
  
  const relV = (vx2 - vx1) * dirX + (vy2 - vy1) * dirY;
  const dMag = -damping * relV;
  
  const dxF = dMag * dirX, dyF = dMag * dirY;
  p1.force_x += dxF;
  p1.force_y += dyF;
  p2.force_x -= dxF;
  p2.force_y -= dyF;
}

// Helper function to find point index in position arrays
function findPointIndex(point) {
  for (const entityName in window.gameBodies) {
    const pointMasses = window.gameBodies[entityName];
    const index = pointMasses.indexOf(point);
    if (index !== -1) {
      return index;
    }
  }
  return -1;
}

function doNotPassGround(points, positionArray, entityName) {
  const r = getPointMassRadius(), canvasH = canvas.height;
  let maxPen = 0;
  positionArray.positions.forEach(([_, y]) => maxPen = Math.max(maxPen, y + r - canvasH));
  if (maxPen > 0) {
    isOnGround[entityName] = true;
    points.forEach((p, i) => {
      positionArray.positions[i][1] -= maxPen;
      p.y = positionArray.positions[i][1];
      if (p.velocity_y > 0) p.velocity_y = 0;
      velocities[entityName].positions[i][1] = p.velocity_y;
    });
  } else {
    isOnGround[entityName] = false;
  }
}

function frictionStuff(points, entityName) {
  normalForces[entityName] = points.map(p => Math.max(0, p.force_y + p.mass * getGravity()));
}

function applyFriction(points, entityName, deltaTime) {
  // Only apply friction if entity is on ground
  if (!isOnGround[entityName]) {
    return;
  }
  
  const muK = getFriction()[2];
  const N = normalForces[entityName][0] || 0;
  const isTryingToMove = keys["a"] || keys["d"] || keys["arrowleft"] || keys["arrowright"];

  points.forEach((p, i) => {
    const vx = p.velocity_x;
    const speed = Math.abs(vx);
    const m = p.mass;

    if (!isTryingToMove && speed < 0.05) {
      p.velocity_x = 0;
      velocities[entityName].positions[i][0] = 0;
      return;
    }

    if (!isTryingToMove) {
      const decel = (muK * N) / m;
      const dv = decel * deltaTime;
      if (speed <= dv) {
        p.velocity_x = 0;
      } else {
        p.velocity_x -= dv * Math.sign(vx);
      }
      velocities[entityName].positions[i][0] = p.velocity_x;
    }
  });
}

function updatePhysics(points, deltaTime) {
  points.forEach(p => p.physics(deltaTime));
}

function collideAgainstWalls(points) {
  points.forEach((p) => {
    if (p.x < width || p.x > width) {
      //Calculate direction vector
      
    }
  });
}

function drawBody(points) {
  const r = getPointMassRadius();
  ctx.strokeStyle = ctx.fillStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath(); ctx.stroke();
  points.forEach(p => {
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.closePath();
  });
}

function displayInfo(entityName) {
  const pointMasses = window.gameBodies[entityName];
  const flatX = pointMasses.map(p => `[${p.x.toFixed(0)},${p.y.toFixed(0)}]`).join(", ");
  const forces = pointMasses.map(p => `[${p.force_x.toFixed(0)},${p.force_y.toFixed(0)}]`).join(", ");
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  console.log(`${entityName} Pos: ${flatX}`);
  console.log(`${entityName} Force: ${forces}`);
  // Display ground state
  console.log(`On Ground: ${isOnGround[entityName]}`);
}

// Simple function to draw the world
function drawWorld() {
  // Draw ground line
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.stroke();
}

// UI helper functions expected by levels
export function showHint(text) {
  // Use the typewriter hint system
  typewriterShowHint(text);
}

export function clearHint() {
  // Use the typewriter hint system
  typewriterClearHint();
}

export function completeLevel() {
  if (!levelMgr.isTitleScreen()) {
    showHint("Level Complete! Press Enter to continue.");
    
    // Listen for Enter key press to proceed to next level
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        document.removeEventListener('keydown', handleKeyPress);
        clearHint();
        levelMgr.loadNext();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
  } else {
    // For title screen, just proceed to next level
    levelMgr.loadNext();
  }
}

function createHintBox() {
  const gameContainer = document.getElementById('gameContainer');

  document.addEventListener("DOMContentLoaded", () => {
    gameContainer.style.position = 'relative'; // Ensure the parent container has relative positioning
    const hintBox = document.createElement('div');
    return hintBox;
  });
}

// Fix level loading
const levelNames = [
  "title_screen",
  "level1_displacement"
  // Add more levels as they're created
];

// Initialize the level manager
const levelMgr = new LevelManager({
  showHint,
  clearHint,
  completeLevel
}, levelNames);

// Start the game by loading the first level
(async function initGame() {
  await levelMgr.loadNext();
  requestAnimationFrame(gameLoop);
})();

// --- MAIN LOOP ---
let lastTS = 0;
function gameLoop(timeStamp) {
  const delta = lastTS ? timeStamp - lastTS : 0;
  const deltaTime = Math.min(delta / 1000, 1 / 30);
  lastTS = timeStamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // (Re)initialize entities at the start of each frame
  // This ensures we handle any entities added by levels
  initializeEntities();
  
  // Get the current entities from the global reference
  const allEntities = window.gameBodies;
  const entities = Object.keys(allEntities);
  const controllableEntities = ["player"]; // Default to only player being controllable

  entities.forEach(entityName => {
    const pointMasses = allEntities[entityName];
    pointMasses.forEach((p, i) => {
      positions[entityName].positions[i] = [p.x, p.y];
      velocities[entityName].positions[i] = [p.velocity_x, p.velocity_y];
      accelerations[entityName].positions[i] = [p.acceleration_x, p.acceleration_y];
    });

    springConstraints(pointMasses, positions[entityName], velocities[entityName], springRestLengths[entityName]);
    
    // Handle ground collision first
    doNotPassGround(pointMasses, positions[entityName], entityName);
    frictionStuff(pointMasses, entityName);
    
    // Only handle player input for controllable entities and not on title screen
    if (controllableEntities.includes(entityName) && !levelMgr.isTitleScreen()) {
      // Allow horizontal movement
      move(keys);
      
      // Only allow jumping when on ground
      if (isOnGround[entityName]) {
        jump(keys);
      }
      
      // Calculate impulses after setting them
      impulseCalc(pointMasses, positions[entityName], velocities[entityName], accelerations[entityName], deltaTime, isOnGround[entityName]);
    }
    
    updatePhysics(pointMasses, deltaTime);
    
    // Only apply friction when on ground and not on title screen
    if (!levelMgr.isTitleScreen()) {
      applyFriction(pointMasses, entityName, deltaTime);
    }
    collideAgainstWalls(pointMasses);

    resetPositions(
      initialStates[entityName].positions,
      initialStates[entityName].velocities,
      initialStates[entityName].accelerations,
      keys,
      pointMasses,
      positions[entityName],
      velocities[entityName],
      accelerations[entityName]
    );
    drawBody(pointMasses);
    displayInfo(entityName);
  });
  drawWorld();

  // Pass the correct variable for delta time
  levelMgr.update(deltaTime);
  levelMgr.draw(ctx, keys);

  requestAnimationFrame(gameLoop);
}