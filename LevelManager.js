// LevelManager.js
export default class LevelManager {
  
  constructor(game, levelList) {
    this.game = game;
    this.levelList = levelList;
    this.idx = 0;
    this.current = null;
    this.titleScreen = null;
    this._isTitleScreen = false;
  }

  /** Tear down old level, import next module, & start it up */
  async loadNext() {
    if (this.current) this.current.cleanup();
    if (this.idx >= this.levelList.length) {
      return this.game.onAllLevelsComplete?.();
    }

    try {
      const name = this.levelList[this.idx++];
      // Check if this is the title screen
      this._isTitleScreen = (name === "title_screen");
      
      // Fix the import path
      const mod = await import(`./levels/${name}.js`).catch(err => {
        console.error(`Failed to load level: ${name}`, err);
        return { default: null };
      });

      if (mod.default) {
        this.current = new mod.default(this.game);
        
        await this.current.preload();
        this.current.init();
      } else {
        console.error(`Level module ${name} didn't export a default class`);
      }
    } catch (err) {
      console.error("Error loading level:", err);
    }
  }

  /** Check if the current level is the title screen */
  isTitleScreen() {
    return this._isTitleScreen;
  }

  /** Called each frame, after your physics step */
  update(dt) {
    this.current?.update(dt);
  }

  /** Called each frame, after drawing the main world */
  draw(ctx, keys) {
    this.current?.draw(ctx, keys);
  }
}