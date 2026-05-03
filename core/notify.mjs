import { platform } from 'node:os';
import { sh }       from './shell.mjs';
import { createLogger } from './logger.mjs';

const log   = createLogger('notify');
const isWin = platform() === 'win32';
const isMac = platform() === 'darwin';

export async function notify(title, message, opts = {}) {
  const truncated = String(message ?? '').slice(0, 200);

  try {
    if (isMac) {
      const script = `display notification ${JSON.stringify(truncated)} with title ${JSON.stringify(title)}`;
      await sh(`osascript -e ${JSON.stringify(script)}`);
    } else if (isWin) {
      const ps = `[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null;` +
        `$notify = New-Object System.Windows.Forms.NotifyIcon;` +
        `$notify.Icon = [System.Drawing.SystemIcons]::Information;` +
        `$notify.Visible = $true;` +
        `$notify.ShowBalloonTip(3000, ${JSON.stringify(title)}, ${JSON.stringify(truncated)}, [System.Windows.Forms.ToolTipIcon]::Info);` +
        `Start-Sleep -Milliseconds 3500; $notify.Dispose()`;
      await sh(`powershell -Command "${ps}"`);
    } else {
      await sh(`notify-send ${JSON.stringify(title)} ${JSON.stringify(truncated)} --expire-time=5000`).catch(() => {});
    }
  } catch (e) {
    log.debug('notify failed (non-fatal)', { error: e.message });
  }
  return { ok: true, title, message: truncated };
}

export async function notifyAlert(alert) {
  const title = `Jelly-Claude Alert: ${alert.type ?? 'unknown'}`;
  const msg   = alert.message ?? `${alert.severity ?? 'info'} on ${alert.token ?? alert.protocol ?? 'unknown'}`;
  return notify(title, msg);
}

export default notify;
