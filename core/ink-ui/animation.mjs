// core/ink-ui/animation.mjs
// Animation utilities for the splash screen

export class OctopusInk {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = options;
    this.startTime = Date.now();
    this.systemInfo = null;
  }

  loadSystemInfo() {
    // Simulate system info loading
    this.systemInfo = {
      cpuUsage: Math.floor(Math.random() * 30) + 10,
      memoryUsage: Math.floor(Math.random() * 40) + 30,
      model: this.options.opusModel || 'claude-3-opus',
      uptime: 0
    };
  }

  draw(elapsedTime) {
    const elapsed = (Date.now() - this.startTime) / 1000; // seconds
    const canvas = this.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    canvas.clear();

    // Draw based on mode
    switch (this.options.mode) {
      case 'anthropic':
      case 'openrouter':
        this.drawSplash(elapsed);
        break;
      case 'none':
        this.drawMinimal(elapsed);
        break;
      default:
        this.drawDefault(elapsed);
    }

    // Draw system info at bottom
    this.drawSystemInfo(elapsed);

    // Render to terminal
    canvas.render();
  }

  drawDefault(elapsed) {
    const canvas = this.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // Draw ink spreading animation (first 3 seconds)
    if (elapsed < 3) {
      const radius = Math.min(width, height) * 0.3 * (elapsed / 3);
      const centerX = width / 2;
      const centerY = height / 2;

      // Dark yellow/black gradient effect
      canvas.drawCircle(centerX, centerY, radius, ' ', '38;5;220;48;5;0');
    }

    // Draw text after ink spreads
    if (elapsed > 0.5 && elapsed < 5) {
      const centerX = width / 2;
      const centerY = height / 2;
      const offset = Math.sin((elapsed - 0.5) * 2) * 2; // Subtle animation

      canvas.drawText(centerX - 10, centerY - 4 + offset, "Jelly", { color: '38;5;255;48;5;0', bold: true });
      canvas.drawText(centerX - 15, centerY + 2 + offset, "Multi-chain AI Agent", { color: '38;5;255;48;5;0' });
    }

    // Draw model info
    if (elapsed > 1 && elapsed < 4) {
      const modelText = `Model: ${this.options.opusModel || 'claude-3-opus'}`;
      canvas.drawText(2, 2, modelText, { color: '38;5;255;48;5;0' });
    }
  }

  drawSplash(elapsed) {
    this.drawDefault(elapsed);
  }

  drawMinimal(elapsed) {
    if (elapsed < 1) {
      canvas.drawText(0, 0, "Jelly-Claude running...", { color: 'white' });
    }
  }

  drawSystemInfo(elapsed) {
    const canvas = this.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // Simulate system info
    if (!this.systemInfo) {
      this.loadSystemInfo();
    }

    const sysInfo = [
      `Uptime: ${this.formatTime(elapsed)}`,
      `CPU: ${this.systemInfo.cpuUsage}% | Mem: ${this.systemInfo.memoryUsage}%`,
      `Model: ${this.systemInfo.model}`,
    ];

    for (let i = 0; i < sysInfo.length; i++) {
      canvas.drawText(2, height - 4 - (sysInfo.length - i), sysInfo[i], { color: '38;5;220;48;5;0' });
    }
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  }
}