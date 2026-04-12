import type { DashboardRuntime, ItemStatus, ItemType } from '../types';

export function typeBadgeClass(type: ItemType) {
    if (type === 'ASSIGNMENT')
        return 'bg-rose-50 text-rose-500 ring-1 ring-rose-100';
    if (type === 'QUIZ')
        return 'bg-indigo-50 text-indigo-500 ring-1 ring-indigo-100';
    if (type === 'LECTURE') return 'bg-sky-50 text-sky-500 ring-1 ring-sky-100';
    if (type === 'FORUM')
        return 'bg-amber-50 text-amber-500 ring-1 ring-amber-100';
    if (type === 'RESOURCE')
        return 'bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100';
    if (type === 'NOTICE')
        return 'bg-violet-50 text-violet-500 ring-1 ring-violet-100';
    return 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200';
}

export function statusChipClass(runtime: DashboardRuntime, status: ItemStatus) {
    const statusClass = runtime.statusClass?.(status);
    if (statusClass === 'todo')
        return 'bg-rose-50 text-rose-600 ring-1 ring-rose-100';
    if (statusClass === 'done')
        return 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100';
    return 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200';
}

export function stateBadgeClass(
    runtime: DashboardRuntime,
    status: ItemStatus,
    dueAt?: number,
) {
    const statusClass = runtime.statusClass?.(status);
    const now = Date.now();
    const in3days = now + 3 * 24 * 60 * 60 * 1000;

    if (statusClass === 'done') {
        return 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100';
    }

    if (statusClass === 'todo') {
        return 'bg-rose-50 text-rose-600 ring-1 ring-rose-100';
    }

    if (typeof dueAt === 'number' && dueAt >= now && dueAt <= in3days) {
        return 'bg-amber-50 text-amber-600 ring-1 ring-amber-100';
    }

    return 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200';
}

export function itemCardToneClass(type: ItemType) {
    if (type === 'ASSIGNMENT')
        return 'border-solid border-zinc-200 border-l-[3px] border-l-rose-200 bg-white hover:border-rose-100 hover:bg-rose-50/35';
    if (type === 'QUIZ')
        return 'border-solid border-zinc-200 border-l-[3px] border-l-indigo-200 bg-white hover:border-indigo-100 hover:bg-indigo-50/35';
    if (type === 'LECTURE')
        return 'border-solid border-zinc-200 border-l-[3px] border-l-sky-200 bg-white hover:border-sky-100 hover:bg-sky-50/35';
    if (type === 'FORUM')
        return 'border-solid border-zinc-200 border-l-[3px] border-l-amber-200 bg-white hover:border-amber-100 hover:bg-amber-50/35';
    if (type === 'RESOURCE')
        return 'border-solid border-zinc-200 border-l-[3px] border-l-emerald-200 bg-white hover:border-emerald-100 hover:bg-emerald-50/35';
    if (type === 'NOTICE')
        return 'border-solid border-zinc-200 border-l-[3px] border-l-violet-200 bg-white hover:border-violet-100 hover:bg-violet-50/35';
    return 'border-solid border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50';
}

export function ddayBadgeClass(dueAt?: number) {
    if (typeof dueAt !== 'number') {
        return 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200';
    }

    const diff = dueAt - Date.now();
    const day = 24 * 60 * 60 * 1000;

    if (diff < 0) {
        return 'bg-rose-50 text-rose-600 ring-1 ring-rose-100';
    }

    if (diff <= day) {
        return 'bg-orange-50 text-orange-600 ring-1 ring-orange-100';
    }

    if (diff <= 3 * day) {
        return 'bg-amber-50 text-amber-600 ring-1 ring-amber-100';
    }

    return 'bg-sky-50 text-sky-600 ring-1 ring-sky-100';
}
