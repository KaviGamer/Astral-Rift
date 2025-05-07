import LevelBase from "./LevelBase.js";
import { bodies } from "../game.js";

export default class TitleScreen extends LevelBase {
  constructor(game) {
    super(game);
    this.name = "XPBD Physics Game";
    this.centerX = 400; // Center X of the canvas
    this.centerY = 300; // Center Y of the canvas
    this.entitiesPositions = {}; // Store original positions
  }

  async preload() {
    // No assets to preload
  }

  init() {
    this.game.showHint("Welcome to the XPBD Physics Game! Press Enter to start.");
    
    // Store original positions of player and NPCs for restoration later
    this.saveEntityPositions();
    
    // Randomize positions of entities around center
    this.randomizeEntityPositions();
    
    // Set up event listener for Enter key press
    this.keyPressHandler = (e) => {
      if (e.key === 'Enter') {
        this.game.completeLevel();
      }
    };
    
    document.addEventListener('keydown', this.keyPressHandler);
  }

  saveEntityPositions() {
    // Save original positions of all entities
    for (const entityName in bodies) {
      this.entitiesPositions[entityName] = bodies[entityName].map(p => ({
        x: p.x,
        y: p.y
      }));
    }
  }

  randomizeEntityPositions() {
    // Randomize positions of all entities
    for (const entityName in bodies) {
      const entity = bodies[entityName];
      
      // Find center of entity
      const centerX = entity.reduce((sum, p) => sum + p.x, 0) / entity.length;
      const centerY = entity.reduce((sum, p) => sum + p.y, 0) / entity.length;
      
      // Calculate offset to place near center of screen with random offset
      const offsetX = this.centerX - centerX + (Math.random() * 300 - 150);
      const offsetY = this.centerY - centerY + (Math.random() * 300 - 150);
      
      // Apply offset to all points
      entity.forEach(p => {
        p.x += offsetX;
        p.y += offsetY;
        // Reset velocities to zero
        p.velocity_x = 0;
        p.velocity_y = 0;
      });
    }
  }

  update(dt) {
    // No custom title screen animation now
  }

  draw(ctx) {
    // Title screen drawing
    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("XPBD Physics Game", 400, 200);
    
    // Draw subtitle
    ctx.font = "24px Arial";
    ctx.fillText("A 2D Physics Simulation", 400, 250);
    
    // Draw instructions with animation effect
    ctx.font = "18px Arial";
    // Pulsing effect for the "Press Enter" text
    const pulseFactor = Math.sin(Date.now() / 300) * 0.2 + 0.8;
    ctx.globalAlpha = pulseFactor;
    ctx.fillText("Press Enter to start", 400, 350);
    ctx.globalAlpha = 1.0;
    
    // Draw controls
    ctx.font = "16px Arial";
    ctx.fillText("Controls: A/D or Left/Right to move, W to jump, R to reset", 400, 500);
  }

  cleanup() {
    // Remove event listener
    document.removeEventListener('keydown', this.keyPressHandler);
    this.game.clearHint();
    
    // Restore original positions of all entities when leaving title screen
    for (const entityName in bodies) {
      const entity = bodies[entityName];
      entity.forEach((p, i) => {
        if (this.entitiesPositions[entityName] && this.entitiesPositions[entityName][i]) {
          p.x = this.entitiesPositions[entityName][i].x;
          p.y = this.entitiesPositions[entityName][i].y;
          p.velocity_x = 0;
          p.velocity_y = 0;
        }
      });
    }
  }
}