import React from 'react';
import { BookOpen, Camera, FileText, Loader2, Save, ScanText, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { deleteReadingDocument, listReadingDocuments, saveReadingDocument, type ReadingDocument } from '../../services/readingLibrary';

interface Props { ownerId: string; }

async function prepareImage(file: File): Promise<{ mimeType: string; data: string }> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Vui lòng chọn ảnh JPG, PNG hoặc WEBP.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Ảnh gốc vượt quá 12 MB. Hãy chọn ảnh nhỏ hơn.');
  const source = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(source.width, source.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(source.width * scale));
    canvas.height = Math.max(1, Math.round(source.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Trình duyệt không thể xử lý ảnh này.');
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    let quality = 0.82;
    let blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    while (blob && blob.size > 850 * 1024 && quality > 0.48) {
      quality -= 0.1;
      blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    }
    if (!blob || blob.size > 900 * 1024) throw new Error('Ảnh vẫn quá lớn sau khi tối ưu. Hãy cắt ảnh gọn hơn.');
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh.'));
      reader.readAsDataURL(blob);
    });
    return { mimeType: 'image/jpeg', data };
  } finally { source.close(); }
}

export const ReadingScreen: React.FC<Props> = ({ ownerId }) => {
  const [documents, setDocuments] = React.useState<ReadingDocument[]>(() => listReadingDocuments(ownerId));
  const [activeId, setActiveId] = React.useState<string | undefined>();
  const [title, setTitle] = React.useState('');
  const [text, setText] = React.useState('');
  const [sourceName, setSourceName] = React.useState('');
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [notes, setNotes] = React.useState<string[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDocuments(listReadingDocuments(ownerId));
    setActiveId(undefined); setTitle(''); setText(''); setSourceName('');
  }, [ownerId]);

  React.useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const chooseFile = async (file?: File) => {
    if (!file) return;
    setError(''); setNotice(''); setNotes([]);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setSourceName(file.name);
    setTitle(file.name.replace(/\.[^.]+$/, '').slice(0, 120) || 'Bài đọc mới');
    setActiveId(undefined);
    setBusy(true);
    try {
      const image = await prepareImage(file);
      const response = await fetch('/api/reading/ocr', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(image)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Không thể nhận diện ảnh.');
      setText(typeof payload.text === 'string' ? payload.text : '');
      setNotes(Array.isArray(payload.notes) ? payload.notes : []);
      setNotice('Đã nhận diện xong. Hãy rà soát văn bản trước khi lưu vào thư viện.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi khi xử lý ảnh.');
    } finally { setBusy(false); }
  };

  const save = () => {
    if (!text.trim()) { setError('Chưa có nội dung để lưu.'); return; }
    try {
      const saved = saveReadingDocument(ownerId, { title, text, sourceName }, activeId);
      setDocuments(listReadingDocuments(ownerId)); setActiveId(saved.id);
      setNotice('Đã lưu bài đọc vào thư viện trên tài khoản này.'); setError('');
    } catch { setError('Không thể lưu bài đọc. Bộ nhớ trình duyệt có thể đã đầy.'); }
  };

  const openDocument = (doc: ReadingDocument) => {
    setActiveId(doc.id); setTitle(doc.title); setText(doc.text); setSourceName(doc.sourceName || '');
    setError(''); setNotice('Đang xem bài đọc đã lưu.'); setNotes([]);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  };

  const removeDocument = (id: string) => {
    if (!window.confirm('Xóa bài đọc này khỏi thư viện trên thiết bị?')) return;
    deleteReadingDocument(ownerId, id); setDocuments(listReadingDocuments(ownerId));
    if (activeId === id) { setActiveId(undefined); setTitle(''); setText(''); setSourceName(''); }
  };

  return <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
    <section className="overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-gradient-to-br from-[#203d31] via-[#2e5140] to-[#52624a] p-5 text-white shadow-lg sm:p-8">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-100"><BookOpen className="h-4 w-4"/> Lina Reading Studio</div>
      <div className="mt-4 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div><h1 className="text-2xl font-black sm:text-3xl">Đọc thông minh cùng Lina</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/90">Biến trang sách và vở ghi tiếng Trung thành tài liệu đọc có thể chỉnh sửa, lưu trữ và phát triển thành bài học. AI ưu tiên chép đúng nguyên văn; bạn luôn kiểm tra trước khi lưu.</p></div>
        <button type="button" onClick={()=>fileRef.current?.click()} disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f2d9a6] px-5 text-sm font-extrabold text-[#26392d] shadow-sm hover:bg-white disabled:opacity-60"><Camera className="h-4 w-4"/> Chụp / tải ảnh lên</button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={e=>{void chooseFile(e.target.files?.[0]);e.currentTarget.value='';}}/>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-50/90"><span className="rounded-full border border-white/20 px-3 py-1.5">JPG · PNG · WEBP</span><span className="rounded-full border border-white/20 px-3 py-1.5">Tối ưu ảnh tự động</span><span className="rounded-full border border-white/20 px-3 py-1.5">Tài liệu riêng theo tài khoản</span></div>
    </section>

    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">{notice}</div>}

    <div className="grid min-w-0 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-extrabold">Thư viện của tôi</h2><span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">{documents.length}/40</span></div>
        {documents.length ? documents.map(doc=><div key={doc.id} className={`group flex items-start gap-2 rounded-2xl border p-3 ${activeId===doc.id?'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20':'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900'}`}>
          <button type="button" onClick={()=>openDocument(doc)} className="min-w-0 flex-1 text-left"><div className="flex items-center gap-2 text-sm font-bold"><FileText className="h-4 w-4 shrink-0 text-emerald-700"/><span className="truncate">{doc.title}</span></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">{doc.text}</p><p className="mt-2 text-[10px] text-stone-400">{new Date(doc.updatedAt).toLocaleDateString('vi-VN')}</p></button>
          <button type="button" onClick={()=>removeDocument(doc.id)} aria-label={`Xóa ${doc.title}`} className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4"/></button>
        </div>) : <div className="rounded-2xl border border-dashed border-stone-300 p-5 text-center dark:border-stone-700"><BookOpen className="mx-auto h-6 w-6 text-stone-400"/><p className="mt-2 text-xs leading-5 text-stone-500">Chưa có tài liệu. Tải ảnh trang sách đầu tiên để tạo thư viện đọc của bạn.</p></div>}
      </aside>

      <section className="min-w-0 space-y-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="flex items-center gap-2 text-sm font-extrabold"><ScanText className="h-4 w-4 text-emerald-700"/> Không gian nhận diện & biên tập</div><p className="mt-1 text-xs text-stone-500">Văn bản OCR có thể sai ở chữ viết tay hoặc ảnh mờ. Hãy đối chiếu bản gốc.</p></div>{busy&&<span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700"><Loader2 className="h-4 w-4 animate-spin"/> Lina đang đọc ảnh…</span>}</div>
        {previewUrl && <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-950"><img src={previewUrl} alt="Ảnh tài liệu nguồn" className="mx-auto max-h-72 w-full object-contain"/></div>}
        <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">Tên bài đọc<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} placeholder="Ví dụ: Gấu con học về hạnh phúc" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"/></label>
        <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">Nội dung tiếng Trung – có thể chỉnh sửa<textarea value={text} onChange={e=>setText(e.target.value)} maxLength={30000} rows={12} placeholder="Chữ Hán nhận diện từ ảnh sẽ xuất hiện ở đây. Bạn cũng có thể nhập hoặc dán văn bản tiếng Trung…" className="mt-2 w-full resize-y rounded-2xl border border-stone-200 bg-[#fffefb] p-4 font-cjk text-base leading-8 text-stone-900 outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"/></label>
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-[11px] text-stone-400">{text.length.toLocaleString('vi-VN')}/30.000 ký tự {sourceName ? `· ${sourceName}` : ''}</span><div className="flex flex-wrap gap-2"><button type="button" onClick={()=>{setText('');setActiveId(undefined);setNotes([]);}} className="min-h-10 rounded-xl border border-stone-200 px-3 text-xs font-bold text-stone-600 dark:border-stone-700 dark:text-stone-300"><X className="mr-1 inline h-3.5 w-3.5"/> Xóa nội dung</button><button type="button" onClick={save} disabled={!text.trim()||busy} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-xs font-extrabold text-white hover:bg-emerald-900 disabled:opacity-40"><Save className="h-4 w-4"/> Lưu bài đọc</button></div></div>
        {notes.length>0&&<div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><div className="mb-1 flex items-center gap-2 font-extrabold"><Sparkles className="h-4 w-4"/> Vùng cần kiểm tra</div>{notes.map((note,i)=><p key={i}>• {note}</p>)}</div>}
        {!previewUrl&&!text&&!busy&&<button type="button" onClick={()=>fileRef.current?.click()} className="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 text-sm font-bold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/10 dark:text-emerald-300"><Upload className="h-5 w-5"/> Chọn ảnh để bắt đầu</button>}
      </section>
    </div>
    <p className="text-[11px] leading-5 text-stone-500">Giai đoạn 1: nhận diện và lưu bản văn bản gốc. Tài liệu hiện được lưu trong bộ nhớ trình duyệt theo tài khoản và thiết bị; chưa đồng bộ đám mây, chưa có phân quyền khóa học hoặc thanh toán. Không tải lên tài liệu có bản quyền nếu bạn không có quyền sử dụng.</p>
  </div>;
};
