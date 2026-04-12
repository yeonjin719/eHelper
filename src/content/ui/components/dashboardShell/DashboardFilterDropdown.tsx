import { useMemo } from 'react';

export interface DashboardFilterDropdownOption {
    value: string;
    label: string;
}

interface DashboardFilterDropdownProps {
    id: string;
    label: string;
    value: string;
    options: DashboardFilterDropdownOption[];
    open: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
}

function Chevron({ open }: { open: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className={[
                'h-4 w-4 shrink-0 text-zinc-400 transition duration-200',
                open ? 'rotate-180 text-zinc-700' : '',
            ].join(' ')}
        >
            <path
                d="M5.25 7.5 10 12.25 14.75 7.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </svg>
    );
}

export function DashboardFilterDropdown({
    id,
    label,
    value,
    options,
    open,
    onToggle,
    onChange,
}: DashboardFilterDropdownProps) {
    const listboxId = `${id}-listbox`;
    const selectedOption = useMemo(
        () => options.find((option) => option.value === value) || options[0],
        [options, value],
    );

    return (
        <div className="relative min-w-0">
            <button
                id={id}
                type="button"
                className="appearance-none flex h-9 w-full items-center justify-between gap-3 rounded-xl border border-solid border-zinc-200 bg-zinc-50 px-3 text-left text-[12px] font-medium text-zinc-700 shadow-none transition hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-label={label}
                onClick={onToggle}
            >
                <span className="truncate">{selectedOption?.label || ''}</span>
                <Chevron open={open} />
            </button>

            {open ? (
                <div
                    id={listboxId}
                    className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-solid border-zinc-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.10)]"
                    role="listbox"
                    aria-label={label}
                >
                    <div className="ecdash-scroll max-h-[240px] overflow-y-auto p-0 rounded-xl">
                        {options.map((option) => {
                            const selected = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    className={[
                                        'appearance-none border-none flex w-full items-center px-3 py-2 text-left text-[12px] font-medium shadow-none transition',
                                        selected
                                            ? 'bg-sky-50 text-sky-700'
                                            : 'text-zinc-700 bg-white hover:bg-zinc-100',
                                    ].join(' ')}
                                    onClick={() => {
                                        onChange(option.value);
                                    }}
                                >
                                    <span className="truncate">
                                        {option.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
