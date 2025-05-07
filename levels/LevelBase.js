// levels/LevelBase.js
export default class LevelBase {
  constructor(game) {
    this.game = game;       // your main Game instance
    this.name = "Unnamed";  // override in subclasses
  }

  /** Load any images/sounds (called before init) */
  async preload() {}

  /** Set up positions, UI hints, event listeners */
  init() {}

  /** Called every physics tick, before drawing */
  update(dt) {}

  /** Draw any level‑specific overlays (arrows, text) */
  draw(ctx) {}

  /** Clean up UI, listeners, timers before next level */
  cleanup() {}
}