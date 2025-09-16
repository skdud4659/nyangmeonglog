import Button from '@/shared/components/atoms/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type AddScheduleForm = {
    petId: string | null;
    title: string;
    date: string; // YYYY-MM-DD
    location: string;
    notificationsEnabled: boolean;
    reminderMinutes: number; // before event
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (form: AddScheduleForm) => Promise<void> | void;
    defaultDate?: string; // prefill
    petOptions: { id: string; name: string; photoUrl?: string | null }[];
    defaultPetId?: string | null;
};

const minuteOptions = [0, 5, 10, 15, 30, 60, 120, 1440];

const AddScheduleModal = ({
    open,
    onClose,
    onSubmit,
    defaultDate,
    petOptions,
    defaultPetId,
}: Props) => {
    const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [form, setForm] = useState<AddScheduleForm>({
        petId: defaultPetId ?? petOptions[0]?.id ?? null,
        title: '',
        date: defaultDate ?? todayIso,
        location: '',
        notificationsEnabled: true,
        reminderMinutes: 60,
    });

    useEffect(() => {
        if (open) {
            setForm({
                petId: defaultPetId ?? petOptions[0]?.id ?? null,
                title: '',
                date: defaultDate ?? todayIso,
                location: '',
                notificationsEnabled: true,
                reminderMinutes: 60,
            });
        }
    }, [open, defaultDate, todayIso, defaultPetId, petOptions]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            if (!form.petId) {
                throw new Error('반려동물을 선택해주세요');
            }
            await onSubmit(form);
            onClose();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : '등록 중 오류가 발생했어요';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                        className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl"
                        style={{ boxShadow: '0px -8px 30px rgba(0,0,0,0.12)' }}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-h4 text-gray_9">일정 등록</h3>
                                <button onClick={onClose}>
                                    <X className="text-gray_6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* 반려동물 선택 */}
                                <div className="flex flex-col">
                                    <label className="text-label text-gray_6 mb-1">반려동물</label>
                                    <select
                                        className="border rounded-xl px-3 py-2 text-body2"
                                        value={form.petId ?? ''}
                                        onChange={e =>
                                            setForm(f => ({ ...f, petId: e.target.value || null }))
                                        }
                                    >
                                        <option value="" disabled>
                                            선택하세요
                                        </option>
                                        {petOptions.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* 내용 */}
                                <div className="flex flex-col">
                                    <label className="text-label text-gray_6 mb-1">내용</label>
                                    <input
                                        type="text"
                                        placeholder="예) 2차 종합백신 접종"
                                        className="border rounded-xl px-3 py-2 text-body2"
                                        value={form.title}
                                        onChange={e =>
                                            setForm(f => ({ ...f, title: e.target.value }))
                                        }
                                    />
                                </div>
                                {/* 날짜 */}
                                <div className="flex flex-col">
                                    <label className="text-label text-gray_6 mb-1">날짜</label>
                                    <input
                                        type="date"
                                        className="border rounded-xl px-3 py-2 text-body2"
                                        value={form.date}
                                        onChange={e =>
                                            setForm(f => ({ ...f, date: e.target.value }))
                                        }
                                    />
                                </div>

                                {/* 장소 */}
                                <div className="flex flex-col">
                                    <label className="text-label text-gray_6 mb-1">장소</label>
                                    <input
                                        type="text"
                                        placeholder="예) ○○○동물병원"
                                        className="border rounded-xl px-3 py-2 text-body2"
                                        value={form.location}
                                        onChange={e =>
                                            setForm(f => ({ ...f, location: e.target.value }))
                                        }
                                    />
                                </div>

                                {/* 알림 */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-label text-gray_6">알림 사용</span>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={form.notificationsEnabled}
                                                onChange={e =>
                                                    setForm(f => ({
                                                        ...f,
                                                        notificationsEnabled: e.target.checked,
                                                    }))
                                                }
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative" />
                                        </label>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2 ${form.notificationsEnabled ? '' : 'opacity-50 pointer-events-none'}`}
                                    >
                                        <span className="text-label text-gray_6 whitespace-nowrap">
                                            언제 알림
                                        </span>
                                        <select
                                            className="border rounded-xl px-3 py-2 text-body2 flex-1"
                                            value={form.reminderMinutes}
                                            onChange={e =>
                                                setForm(f => ({
                                                    ...f,
                                                    reminderMinutes: Number(e.target.value),
                                                }))
                                            }
                                        >
                                            {minuteOptions.map(m => (
                                                <option key={m} value={m}>
                                                    {m === 0
                                                        ? '정각'
                                                        : m < 60
                                                          ? `${m}분 전`
                                                          : m === 60
                                                            ? '1시간 전'
                                                            : m === 120
                                                              ? '2시간 전'
                                                              : `${m / 1440}일 전`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 text-error text-label text-center">
                                    {error}
                                </div>
                            )}

                            <div className="mt-6 grid grid-cols-2 gap-2">
                                <Button
                                    label="취소"
                                    variant="secondary"
                                    onClick={onClose}
                                    disabled={submitting}
                                />
                                <Button
                                    label={submitting ? '등록 중...' : '등록'}
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddScheduleModal;
