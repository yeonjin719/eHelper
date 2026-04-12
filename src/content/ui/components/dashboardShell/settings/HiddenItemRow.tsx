import type { HiddenItemPreview } from '../types';
import { getHiddenStatusTagClass } from './settingsUtils';

interface HiddenItemRowProps {
    item: HiddenItemPreview;
    onUnhideItem: (itemId: string) => void | Promise<void>;
}

export function HiddenItemRow({ item, onUnhideItem }: HiddenItemRowProps) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] px-3 py-3 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="m-0 break-words text-[13px] font-semibold leading-5 text-zinc-950 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                        {item.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex max-w-full rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[1px] font-semibold text-sky-700">
                            {item.courseName}
                        </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold leading-none text-zinc-700">
                            {item.typeLabel}
                        </span>
                        <span
                            className={[
                                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none',
                                getHiddenStatusTagClass(item.statusLabel),
                            ].join(' ')}
                        >
                            {item.statusLabel}
                        </span>
                        {item.dueLabel ? (
                            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold leading-none text-amber-700">
                                {item.dueLabel}
                            </span>
                        ) : null}
                    </div>
                </div>
                <button
                    type="button"
                    className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-semibold text-zinc-700 shadow-[0_4px_10px_rgba(15,23,42,0.05)] transition hover:border-zinc-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
                    onClick={() => {
                        void onUnhideItem(item.id);
                    }}
                >
                    복원
                </button>
            </div>
        </div>
    );
}
