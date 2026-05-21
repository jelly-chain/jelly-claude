// core/ink-ui/canvas.mjs
// Simple canvas implementation for terminal

export class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = new Array(height).fill(0).map(() => new Array(width).fill(' '));
    this.styles = new Array(height).fill(0).map(() => new Array(width).fill(''));
  }

  clear() {
    this.pixels = new Array(this.height).fill(0).map(() => new Array(this.width).fill(' '));
    this.styles = new Array(this.height).fill(0).map(() => new Array(this.width).fill(''));
  }

  draw(x, y, char, style = '') {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.pixels[y][x] = char;
      this.styles[y][x] = style;
    }
  }

  drawRect(x, y, width, height, char, style = '') {
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        this.draw(i, j, char, style);
      }
    }
  }

  drawCircle(x, y, radius, char, style = '') {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        if (Math.sqrt((i - x) ** 2 + (j - y) ** 2) <= radius) {
          this.draw(i, j, char, style);
        }
      }
    }
  }

  drawText(x, y, text, style = '') {
    for (let i = 0; i < text.length; i++) {
      this.draw(x + i, y, text[i], style);
    }
  }

  render() {
    const output = this.pixels.map((row, y) => {
      return row.map((char, x) => {
        const style = this.styles[y][x];
        return style ? `{${style}}${char}{/}` : char;
      }).join('');
    }).join('\n');

    process.stdout.write('\x1b[2J\x1b[H' + output);
  }
}

export class AnimationFrame {
  constructor(callback, fps = 30) {
    this.callback = callback;
    this.fps = fps;
    this.interval = 1000 / fps;
    this.animationId = null;
    this.lastTime = 0;
  }

  start() {
    const loop = (timestamp) => {
      const elapsed = timestamp - this.lastTime;
      if (elapsed > this.interval) {
        this.callback(timestamp);
        this.lastTime = timestamp - (elapsed % this.interval);
      }
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}