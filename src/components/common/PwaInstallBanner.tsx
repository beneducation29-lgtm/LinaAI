import React from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { getPwaInstallState, promptPwaInstall, subscribePwaInstall } from '../../services/pwa';

export const PwaInstallBanner: React.FC = () => {
  const [install, setInstall] = React.useState(getPwaInstallState);
  const [online, setOnline] = React.useState(() => navigator.onLine);
  const [dismissed, setDismissed] = React.useState(false);
  React.useEffect(() => {
    const unsubscribe = subscribePwaInstall(setInstall);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline); window.addEventListener('offline', onOffline);
    return () => { unsubscribe(); window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);
  if (install.isInstalled || dismissed) return null;
  if (!online) return <div className="fixed left-3 right-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-4 z-50 mx-auto max-w-lg rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/95 dark:bg-amber-950/90 backdrop-blur-md px-4 py-3 shadow-lg"><div className="flex items-center gap-3"><WifiOff className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0"/><p className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex-1">Bạn đang offline. Lina vẫn giữ giao diện đã tải và tiến trình cục bộ.</p><button type="button" onClick={()=>setDismissed(true)} className="p-1.5 rounded-lg text-amber-700 dark:text-amber-300" aria-label="Đóng thông báo offline"><X className="w-4 h-4"/></button></div></div>;
  if (!install.canInstall && !install.isIos) return null;
  return <div className="fixed left-3 right-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-4 z-50 mx-auto max-w-lg rounded-2xl border border-stone-200 dark:border-stone-700 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-4 py-3 shadow-lg"><div className="flex items-center gap-3"><Download className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0"/><div className="flex-1 min-w-0"><p className="text-xs font-bold text-stone-900 dark:text-stone-100">Cài Lina AI lên điện thoại</p><p className="text-[11px] text-stone-500 dark:text-stone-400">{install.isIos ? "Trên Safari: bấm Chia sẻ → Thêm vào Màn hình chính." : "Mở nhanh như app, tối ưu cho màn hình phone."}</p></div>{install.canInstall && <button type="button" onClick={()=>void promptPwaInstall()} className="px-3 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold whitespace-nowrap">Cài app</button>}<button type="button" onClick={()=>setDismissed(true)} className="p-1.5 rounded-lg text-stone-400" aria-label="Đóng banner cài app"><X className="w-4 h-4"/></button></div></div>;
};
