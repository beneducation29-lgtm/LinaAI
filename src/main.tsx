import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerPwa } from './services/pwa';

registerPwa();

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
else document.body.innerHTML = '<div style="padding:24px;font-family:sans-serif">Lina đang tạm gián đoạn. Vui lòng tải lại trang.</div>';
