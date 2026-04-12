import { useEffect, useRef, useState } from 'react';
import { DUE_FILTER_OPTIONS, TYPE_FILTER_OPTIONS } from './constants';
import {
    DashboardFilterDropdown,
    type DashboardFilterDropdownOption,
} from './DashboardFilterDropdown';

interface DashboardFilterBarProps {
    filter: string[];
    typeFilter: string[];
    hideResources: boolean;
    hideNotices: boolean;
    allCourses: string[];
    newCourseNames: string[];
    courseFilter: string;
    courseFilterAllValue: string;
    onFilterChange: (values: string[]) => void;
    onTypeFilterChange: (values: string[]) => void;
    onSelectCourse: (course: string) => void;
}

function toggleMultiValue(
    currentValues: string[],
    targetValue: string,
    onChange: (values: string[]) => void,
) {
    if (currentValues.includes(targetValue)) {
        onChange(currentValues.filter((value) => value !== targetValue));
        return;
    }

    onChange([...currentValues, targetValue]);
}

export function DashboardFilterBar({
    filter,
    typeFilter,
    hideResources,
    hideNotices,
    allCourses,
    newCourseNames,
    courseFilter,
    courseFilterAllValue,
    onFilterChange,
    onTypeFilterChange,
    onSelectCourse,
}: DashboardFilterBarProps) {
    const [openDropdown, setOpenDropdown] = useState<'due' | 'course' | null>(
        null,
    );
    const barRef = useRef<HTMLDivElement | null>(null);
    const selectedDueFilter = filter[0] || 'ALL';
    const typeFilterSet = new Set(typeFilter);
    const isNotDoneFilterActive = selectedDueFilter === 'NOT_DONE';
    const dueOptions: DashboardFilterDropdownOption[] = DUE_FILTER_OPTIONS;
    const courseOptions: DashboardFilterDropdownOption[] = [
        {
            value: courseFilterAllValue,
            label: '과목 전체',
        },
        ...allCourses.map((courseName) => ({
            value: courseName,
            label: `${courseName}${newCourseNames.includes(courseName) ? ' *' : ''}`,
        })),
    ];
    const visibleTypeFilterOptions = TYPE_FILTER_OPTIONS.filter((option) => {
        if (hideResources && option.value === 'RESOURCE') return false;
        if (hideNotices && option.value === 'NOTICE') return false;
        return true;
    });

    useEffect(() => {
        if (!openDropdown) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const path =
                typeof event.composedPath === 'function'
                    ? event.composedPath()
                    : [];

            if (barRef.current && path.includes(barRef.current)) {
                return;
            }

            setOpenDropdown(null);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openDropdown]);

    return (
        <div
            ref={barRef}
            className="space-y-2 border-b border-zinc-100 bg-zinc-50/70 px-4 py-3"
        >
            <div className="grid grid-cols-2 gap-2">
                <DashboardFilterDropdown
                    id="ecdash-due-filter"
                    label="마감 필터"
                    value={selectedDueFilter}
                    options={dueOptions}
                    open={openDropdown === 'due'}
                    onToggle={() => {
                        setOpenDropdown((current) =>
                            current === 'due' ? null : 'due',
                        );
                    }}
                    onChange={(value) => {
                        setOpenDropdown(null);
                        onFilterChange(value === 'ALL' ? [] : [value]);
                    }}
                />

                <DashboardFilterDropdown
                    id="ecdash-course-filter"
                    label="과목 필터"
                    value={courseFilter}
                    options={courseOptions}
                    open={openDropdown === 'course'}
                    onToggle={() => {
                        setOpenDropdown((current) =>
                            current === 'course' ? null : 'course',
                        );
                    }}
                    onChange={(value) => {
                        setOpenDropdown(null);
                        onSelectCourse(value);
                    }}
                />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                <button
                    type="button"
                    className={[
                        'inline-flex h-8 items-center rounded-full border px-3 text-[12px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100',
                        !typeFilter.length
                            ? 'border-sky-300 bg-sky-50 text-sky-700 focus:bg-sky-50 focus:border-sky-300 focus:text-sky-700 active:bg-sky-50'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:bg-sky-50 focus:bg-white focus:border-zinc-200 focus:text-zinc-600 active:bg-white',
                    ].join(' ')}
                    onClick={() => {
                        onTypeFilterChange([]);
                    }}
                >
                    전체
                </button>

                <button
                    type="button"
                    className={[
                        'inline-flex h-8 items-center rounded-full border px-3 text-[12px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100',
                        isNotDoneFilterActive
                            ? 'border-sky-300 bg-sky-50 text-sky-700 focus:bg-sky-50 focus:border-sky-300 focus:text-sky-700 active:bg-sky-50'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:bg-sky-50 focus:bg-white focus:border-zinc-200 focus:text-zinc-600 active:bg-white',
                    ].join(' ')}
                    onClick={() => {
                        onFilterChange(
                            isNotDoneFilterActive ? [] : ['NOT_DONE'],
                        );
                    }}
                >
                    미완료
                </button>

                {visibleTypeFilterOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        className={[
                            'inline-flex h-8 items-center rounded-full border px-3 text-[12px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100',
                            typeFilterSet.has(option.value)
                                ? 'border-sky-300 bg-sky-50 text-sky-700 focus:bg-sky-50 focus:border-sky-300 focus:text-sky-700 active:bg-sky-50'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-sky-50 focus:bg-white focus:border-zinc-200 focus:text-zinc-600 active:bg-white',
                        ].join(' ')}
                        onClick={() => {
                            toggleMultiValue(
                                typeFilter,
                                option.value,
                                onTypeFilterChange,
                            );
                        }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
