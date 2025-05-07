import LevelBase from "./LevelBase.js";
import { keys } from "../game.js";
import { PointMass } from "../pointMass.js";

export default class Level1_Displacement extends LevelBase {
  constructor(game) {
    super(game);
    this.name = "Position & Displacement";
    
    // Define our own entities for this level
    this.defineEntities();
    
    // Track current target
    this.currentTargetIndex = 0;
    this.targets = [
      { x: 100, y: 50, color: "blue" },
      { x: 400, y: 300, color: "green" },
      { x: 700, y: 250, color: "red" }
    ];
    
    this.startPos = null;  // Updated after each target is reached
    this.lineTriggered = false;
    this.targetReached = [false, false, false];
    this.startedMoving = false;
    this.levelFinished = false;
  }
  
  // Define entities specific to this level
  defineEntities() {
    // Store the original bodies if needed for cleanup
    this.originalBodies = window.gameBodies || {};
    
    // Create a new player entity (a square box made of 4 point masses)
    this.player = [
      new PointMass(300, 100, 1),
      new PointMass(300, 300, 1),
      new PointMass(100, 300, 1),
      new PointMass(100, 100, 1)
    ];
    
    // Create a global reference for the game engine to use
    // This replaces the need to import from game.js
    window.gameBodies = {
      player: this.player
      // No NPC/second box as requested
    };
  }

  async preload() {
    // no assets for this level
  }

  init() {
    // Compute start center of the box using our level-defined player
    this.playerStartCenter = this._calcCenter(this.player);
    
    // Initialize the start position for displacement vector
    this.startPos = this.playerStartCenter;
    
    // Show instructions
    this.game.showHint(
      "Roll the box into each colored target square in order. The yellow arrow shows your displacement vector!"
    );
  }

  update(dt) {
    const currentCenter = this._calcCenter(this.player);
    
    // Calculate displacement vector from current start position
    const dispVec = {
      x: currentCenter.x - this.startPos.x,
      y: currentCenter.y - this.startPos.y
    };
    
    // Check if the player started moving
    if (!this.startedMoving && (keys["a"] || keys["d"])) {
      this.startedMoving = true;
    }
    
    // Check if player reached the current target
    if (!this.targetReached[this.currentTargetIndex]) {
      const target = this.targets[this.currentTargetIndex];
      const distToTarget = this._distance(currentCenter, target);
      
      if (distToTarget < 20) {  // Within 20px of target
        this.targetReached[this.currentTargetIndex] = true;
        
        // Update start position for next displacement vector
        this.startPos = { ...target };
        
        // Show appropriate hint based on which target was reached
        if (this.currentTargetIndex === 0) {
          this.game.showHint("Great! Now head to the green target. Watch your displacement vector change!");
        } else if (this.currentTargetIndex === 1) {
          this.game.showHint("Perfect! Now for the final red target. Your displacement vector shows your movement from the green square.");
        }
        
        // Move to next target
        this.currentTargetIndex++;
        
        // Check if all targets were reached
        if (this.currentTargetIndex >= this.targets.length) {
          this.levelFinished = true;
          this.game.completeLevel();
        }
      }
    }
  }



  draw(ctx) {
    // Draw grid background for coordinate reference
    this._drawGrid(ctx);
    
    // Draw all target squares
    this.targets.forEach((target, index) => {
      // Dim targets that aren't active yet
      if (index < this.currentTargetIndex) {
        ctx.fillStyle = "gray";  // Already reached
      } else if (index === this.currentTargetIndex) {
        ctx.fillStyle = target.color;  // Current target
      } else {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = target.color;  // Future target
        ctx.globalAlpha = 1.0;
      }
      
      this._drawSquare(ctx, target, 20);
      
      // Add coordinate label next to each target
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.fillText(`(${target.x}, ${target.y})`, target.x + 15, target.y - 10);
    });
    
    // Draw displacement vector as an arrow if player started moving
    if (this.startedMoving) {
      const currentCenter = this._calcCenter(this.player);
      const sx = this.startPos.x, sy = this.startPos.y;
      const ex = currentCenter.x, ey = currentCenter.y;
      
      // Draw line
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      
      // Draw arrowhead
      const angle = Math.atan2(ey - sy, ex - sx);
      const headLen = 10;
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
      
      // Draw numerical vector text
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      const dx = ex - sx;
      const dy = ey - sy;
      ctx.fillText(`(${dx.toFixed(0)}, ${dy.toFixed(0)})`, 
        sx + (dx / 2) + 5,
        sy + (dy / 2) - 5
      );
      
      // Display current target information
      if (!this.levelFinished) {
        const target = this.targets[this.currentTargetIndex];
        
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText(`Target: ${this.currentTargetIndex + 1}/3 (${target.x}, ${target.y})`, 20, 30);
      }
    }
  }
  
  _drawGrid(ctx) {
    ctx.strokeStyle = "rgba(100, 100, 100, 0.2)";
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= 800; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
      
      // Add x-coordinate label
      ctx.fillStyle = "rgba(150, 150, 150, 0.5)";
      ctx.font = "10px Arial";
      ctx.fillText(x.toString(), x + 5, 15);
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= 600; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
      
      // Add y-coordinate label
      ctx.fillStyle = "rgba(150, 150, 150, 0.5)";
      ctx.font = "10px Arial";
      ctx.fillText(y.toString(), 5, y + 15);
    }
  }

  cleanup() {
    // Clear any UI hints
    this.game.clearHint();
    
    // Restore original bodies if they existed
    if (Object.keys(this.originalBodies).length > 0) {
      window.gameBodies = this.originalBodies;
    }
  }

  // --- helpers ---
  _calcCenter(points) {
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
  }

  _distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.hypot(dx, dy);
  }

  _drawSquare(ctx, center, size) {
    ctx.fillRect(center.x - size/2, center.y - size/2, size, size);
  }
}