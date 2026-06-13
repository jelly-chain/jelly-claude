import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ALERTS_FILE = join(process.cwd(), 'modules', 'alerts', 'data', 'alerts.json');

export class AlertStorage {
  constructor() {
    this.ensureDataDir();
    this.alerts = this.load();
  }

  ensureDataDir() {
    const dir = join(process.cwd(), 'modules', 'alerts', 'data');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (!existsSync(ALERTS_FILE)) {
      this.save({ alerts: [], nextId: 1 });
    }
  }

  load() {
    try {
      if (existsSync(ALERTS_FILE)) {
        const data = readFileSync(ALERTS_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error.message);
    }
    return { alerts: [], nextId: 1 };
  }

  save(data) {
    try {
      writeFileSync(ALERTS_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving alerts:', error.message);
      return false;
    }
  }

  getAll() {
    return [...this.alerts.alerts];
  }

  getById(id) {
    return this.alerts.alerts.find(alert => alert.id === id);
  }

  add(alert) {
    alert.id = this.alerts.nextId++;
    alert.createdAt = new Date().toISOString();
    alert.updatedAt = alert.createdAt;
    this.alerts.alerts.push(alert);
    this.save(this.alerts);
    return alert;
  }

  remove(id) {
    const index = this.alerts.alerts.findIndex(alert => alert.id === id);
    if (index === -1) return false;

    this.alerts.alerts.splice(index, 1);
    this.save(this.alerts);
    return true;
  }

  update(id, updates) {
    const alert = this.getById(id);
    if (!alert) return null;

    Object.assign(alert, updates, { updatedAt: new Date().toISOString() });
    this.save(this.alerts);
    return alert;
  }

  clear() {
    this.alerts = { alerts: [], nextId: 1 };
    this.save(this.alerts);
    return true;
  }
}

export const alertStorage = new AlertStorage();