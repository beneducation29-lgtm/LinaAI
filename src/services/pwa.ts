export interface PwaInstallState { canInstall: boolean; isInstalled: boolean; }
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted'|'dismissed'; platform: string }>; };
let deferredPrompt: BeforeInstallPromptEvent | null = null;
export function registerPwa() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => undefined); });
}
export function isStandaloneDisplay() {
  return window.matchMedia?.('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}
export function getPwaInstallState(): PwaInstallState { return { canInstall: Boolean(deferredPrompt), isInstalled: isStandaloneDisplay() }; }
export function subscribePwaInstall(listener: (state: PwaInstallState) => void) {
  const emit = () => listener(getPwaInstallState());
  const onBeforeInstall = (event: Event) => { event.preventDefault(); deferredPrompt = event as BeforeInstallPromptEvent; emit(); };
  const onInstalled = () => { deferredPrompt = null; emit(); };
  window.addEventListener('beforeinstallprompt', onBeforeInstall);
  window.addEventListener('appinstalled', onInstalled);
  emit();
  return () => { window.removeEventListener('beforeinstallprompt', onBeforeInstall); window.removeEventListener('appinstalled', onInstalled); };
}
export async function promptPwaInstall() {
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return choice.outcome === 'accepted';
}
