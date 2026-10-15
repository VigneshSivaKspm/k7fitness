import { Capacitor, registerPlugin, SystemBars, SystemBarsStyle, SystemBarType } from '@capacitor/core';

/** True inside the Android app (Capacitor), false in a browser. */
export const isNative = Capacitor.isNativePlatform();

// Local plugin in android/app/src/main/java/com/k7fitness/admin/PrintPlugin.java
const K7Print = registerPlugin('K7Print');

/** Light status-bar icons over the dark header, dark gesture-bar icons over the white tab bar. */
export function initSystemBars() {
  if (!isNative) return;
  SystemBars.setStyle({ style: SystemBarsStyle.Dark, bar: SystemBarType.StatusBar }).catch(() => {});
  SystemBars.setStyle({ style: SystemBarsStyle.Light, bar: SystemBarType.NavigationBar }).catch(() => {});
}

/** window.print() is a no-op in Android WebView; the native plugin opens the system print / Save-as-PDF sheet. */
export function printPage(jobName = document.title) {
  if (isNative) return K7Print.print({ name: jobName });
  window.print();
  return Promise.resolve();
}

/**
 * Saves a text file. Browsers download it; the app writes it to the cache and
 * opens the share sheet (Drive, WhatsApp, Gmail, Files…).
 */
export async function saveTextFile(filename, text, mime = 'text/plain') {
  if (!isNative) {
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')]);
  const { uri } = await Filesystem.writeFile({ path: filename, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
  try {
    await Share.share({ title: filename, files: [uri], dialogTitle: `Save or share ${filename}` });
  } catch (err) {
    // Closing the share sheet without picking an app is not an error.
    if (!/cancel/i.test(err?.message || '')) throw err;
  }
}
