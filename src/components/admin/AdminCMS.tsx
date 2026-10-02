import React from 'react';
import { CheckCircle2, FileText, History, Plus, Save, ShieldCheck } from 'lucide-react';
import {
  CMS_STATUSES,
  CMS_TYPES,
  type CMSContentItem,
  type CMSContentType,
  type CMSWorkflowStatus,
} from '../../types/cms';
import {
  adminMe,
  fetchCMSContent,
  rollbackCMSContent,
  saveCMSContent,
} from '../../services/adminCMS';
import { validateCMSItem } from '../../services/cmsValidation';

const labels: Record<CMSContentType, string> = {
  hsk_level: 'HSK levels',
  course: 'Courses',
  unit: 'Units',
  lesson: 'Lessons',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  dialogue: 'Dialogues',
  audio: 'Audio',
  speaking: 'Speaking',
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  roleplay: 'Roleplay',
  story: 'Stories',
  quiz: 'Quizzes',
};

const statusLabels: Record<CMSWorkflowStatus, string> = {
  draft: 'Draft',
  review: 'Review',
  published: 'Published',
  archived: 'Archived',
};

const blank = (type: CMSContentType): CMSContentItem => ({
  id: '',
  type,
  slug: '',
  title: '',
  status: 'draft',
  data:
    type === 'vocabulary'
      ? {
          hanzi: '',
          pinyin: '',
          vietnamese: '',
          english: '',
          partOfSpeech: '',
          hsk: 'HSK 1',
          example: '',
          audio: '',
          difficulty: 1,
          tags: '',
        }
      : type === 'lesson'
        ? {
            objective: '',
            grammar: '',
            vocabulary: '',
            dialogue: '',
            activities: '',
            quiz: '',
            roleplay: '',
            estimatedMinutes: 20,
            hsk: 'HSK 1',
          }
        : {},
  contentVersion: 1,
  updatedBy: '',
  updatedAt: '',
  createdAt: '',
});

export const AdminCMS: React.FC = () => {
  const [ok, setOk] = React.useState<boolean | null>(null);
  const [items, setItems] = React.useState<CMSContentItem[]>([]);
  const [type, setType] = React.useState<CMSContentType>('lesson');
  const [status, setStatus] = React.useState<CMSWorkflowStatus | ''>('');
  const [selected, setSelected] = React.useState<CMSContentItem | null>(null);
  const [issues, setIssues] = React.useState<Array<{ field: string; message: string; severity: string }>>([]);
  const [message, setMessage] = React.useState('');

  const load = React.useCallback(async () => {
    try {
      const next = await fetchCMSContent({
        type,
        status: status || undefined,
      });
      setItems(next);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'CMS error');
    }
  }, [type, status]);

  React.useEffect(() => {
    void adminMe().then((result) => setOk(Boolean(result?.admin)));
  }, []);

  React.useEffect(() => {
    if (ok) void load();
  }, [ok, load]);

  if (ok === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
        Đang xác thực Admin…
      </div>
    );
  }

  if (!ok) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-white p-6 text-center">
        <div>
          <ShieldCheck className="mx-auto" />
          <h1 className="text-2xl font-bold mt-3">Admin CMS</h1>
          <p className="text-slate-400 mt-2">Tài khoản chưa được cấp quyền quản trị.</p>
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-white text-slate-900"
          >
            Về Lina AI
          </button>
        </div>
      </div>
    );
  }

  const save = async (nextStatus?: CMSWorkflowStatus) => {
    if (!selected) return;

    const nextItem: CMSContentItem = {
      ...selected,
      status: nextStatus || selected.status,
      updatedAt: new Date().toISOString(),
    };

    const validation = validateCMSItem(nextItem, items);
    setIssues(validation);

    if (validation.some((issue) => issue.severity === 'error')) return;

    try {
      const saved = await saveCMSContent(nextItem);
      setSelected(saved);
      setMessage('Đã lưu.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Lỗi lưu');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 border-r border-slate-800 p-4 hidden md:block">
        <b>Lina CMS</b>
        <p className="text-xs text-slate-500">Content Operations</p>
        <div className="mt-5 space-y-1">
          {CMS_TYPES.map((itemType) => (
            <button
              key={itemType}
              onClick={() => {
                setType(itemType);
                setSelected(null);
              }}
              className={`w-full text-left p-2 rounded-lg text-sm ${type === itemType ? 'bg-amber-400 text-slate-950' : ''}`}
            >
              {labels[itemType]}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1">
        <header className="border-b border-slate-800 p-5 flex justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex gap-2">
              <ShieldCheck /> Admin CMS
            </h1>
            <p className="text-xs text-slate-500">
              Draft → Review → Published → Archived · AI không tự publish
            </p>
          </div>
          <button
            onClick={() => {
              setSelected(blank(type));
              setIssues([]);
              setMessage('');
            }}
            className="bg-amber-400 text-slate-950 px-3 py-2 rounded-xl flex gap-1"
          >
            <Plus /> Tạo mới
          </button>
        </header>

        <div className="p-5 grid xl:grid-cols-[320px_1fr] gap-5">
          <section className="border border-slate-800 rounded-2xl p-3">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as CMSWorkflowStatus | '')}
              className="bg-slate-900 p-2 rounded-lg text-xs mb-3"
            >
              <option value="">Tất cả workflow</option>
              {CMS_STATUSES.map((itemStatus) => (
                <option key={itemStatus} value={itemStatus}>
                  {statusLabels[itemStatus]}
                </option>
              ))}
            </select>

            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelected(item);
                  setIssues([]);
                  setMessage('');
                }}
                className="block w-full text-left p-3 rounded-xl hover:bg-slate-900"
              >
                <b className="text-sm">{item.title || item.slug}</b>
                <div className="text-[11px] text-slate-500">
                  {statusLabels[item.status]} · v{item.contentVersion}
                </div>
              </button>
            ))}
          </section>

          <section className="border border-slate-800 rounded-2xl p-5">
            {selected ? (
              <>
                <div className="flex justify-between gap-3">
                  <div className="flex-1">
                    <small className="text-slate-500">
                      {labels[selected.type]} · v{selected.contentVersion}
                    </small>
                    <input
                      value={selected.title}
                      onChange={(event) =>
                        setSelected({ ...selected, title: event.target.value })
                      }
                      placeholder="Tiêu đề"
                      className="block w-full bg-transparent text-xl font-bold border-b border-slate-700 py-2"
                    />
                  </div>

                  <button
                    disabled={selected.contentVersion < 2}
                    onClick={() => {
                      void rollbackCMSContent(
                        selected.id,
                        selected.contentVersion - 1,
                      ).then((rolledBack) => {
                        setSelected(rolledBack);
                        setMessage('Đã rollback');
                      });
                    }}
                    className="h-10 px-3 border border-slate-700 rounded-xl text-xs flex gap-1 disabled:opacity-30"
                  >
                    <History /> Rollback
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  <input
                    value={selected.slug}
                    onChange={(event) =>
                      setSelected({ ...selected, slug: event.target.value })
                    }
                    placeholder="slug"
                    className="bg-slate-900 p-2 rounded-lg border border-slate-700"
                  />

                  <select
                    value={selected.status}
                    onChange={(event) =>
                      setSelected({
                        ...selected,
                        status: event.target.value as CMSWorkflowStatus,
                      })
                    }
                    className="bg-slate-900 p-2 rounded-lg border border-slate-700"
                  >
                    {CMS_STATUSES.map((itemStatus) => (
                      <option key={itemStatus} value={itemStatus}>
                        {statusLabels[itemStatus]}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={JSON.stringify(selected.data, null, 2)}
                  onChange={(event) => {
                    try {
                      setSelected({
                        ...selected,
                        data: JSON.parse(event.target.value),
                      });
                    } catch {
                      // Keep the current object until JSON becomes valid.
                    }
                  }}
                  rows={22}
                  className="mt-4 w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs"
                />

                {issues.map((issue, index) => (
                  <div key={index} className="text-xs text-rose-300 mt-1">
                    • {issue.field}: {issue.message}
                  </div>
                ))}

                {message && (
                  <div className="text-xs text-amber-300 mt-3">{message}</div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => void save()}
                    className="bg-white text-slate-950 px-4 py-2 rounded-xl font-semibold flex gap-1"
                  >
                    <Save /> Lưu Draft
                  </button>
                  <button
                    onClick={() => void save('review')}
                    className="border border-amber-500 text-amber-300 px-4 py-2 rounded-xl"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => void save('published')}
                    className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl font-semibold flex gap-1"
                  >
                    <CheckCircle2 /> Publish
                  </button>
                </div>
              </>
            ) : (
              <div className="min-h-[500px] grid place-items-center text-slate-500">
                <div className="flex items-center gap-2">
                  <FileText /> Chọn nội dung hoặc tạo mới.
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
