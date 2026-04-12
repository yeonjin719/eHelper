export interface SettingsToggleOptionProps {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void | Promise<void>;
}

export function SettingsToggleOption({
    id,
    label,
    description,
    checked,
    onChange,
}: SettingsToggleOptionProps) {
    return (
        <label className="ecdash-settings-option flex items-start justify-between gap-5 rounded-[20px] border border-zinc-200/45 bg-zinc-50/35 px-1 py-[18px] text-zinc-800 transition hover:border-zinc-200/70 hover:bg-white focus-within:border-sky-200 focus-within:bg-white [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
            <div className="min-w-0 space-y-1.5">
                <span className="block text-[13px] font-medium leading-6 text-zinc-900 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                    {label}
                </span>
                {description ? (
                    <span className="block text-[12px] font-medium leading-6 text-zinc-600 [background-image:none!important] [border-bottom:0!important] [box-shadow:none!important] [text-decoration:none!important]">
                        {description}
                    </span>
                ) : null}
            </div>
            <span
                className={[
                    'relative mt-1 inline-flex h-7 w-12 shrink-0 items-center overflow-hidden rounded-full border transition focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-100',
                    checked
                        ? 'border-sky-300 bg-sky-500 shadow-[inset_0_1px_2px_rgba(2,132,199,0.18)]'
                        : 'border-zinc-200 bg-white shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]',
                ].join(' ')}
                aria-hidden="true"
            >
                <input
                    id={id}
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(event) => {
                        void onChange(Boolean(event.target.checked));
                    }}
                />
                <span
                    className={[
                        'pointer-events-none absolute top-[3px] inline-flex h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.18)] transition-[left] duration-200',
                        checked ? 'left-[23px]' : 'left-[3px]',
                    ].join(' ')}
                />
            </span>
        </label>
    );
}
