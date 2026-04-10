import { DUE_FILTER_OPTIONS, TYPE_FILTER_OPTIONS } from './constants';

interface DashboardFilterBarProps {
    filter: string[];
    typeFilter: string[];
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
    allCourses,
    newCourseNames,
    courseFilter,
    courseFilterAllValue,
    onFilterChange,
    onTypeFilterChange,
    onSelectCourse,
}: DashboardFilterBarProps) {
    const selectedDueFilter = filter[0] || 'ALL';
    const typeFilterSet = new Set(typeFilter);
    const isNotDoneFilterActive = selectedDueFilter === 'NOT_DONE';

    return (
        <div className="space-y-2 border-b border-zinc-100 bg-zinc-50/70 px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
                <select
                    id="ecdash-due-filter"
                    className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-[12px] font-medium text-zinc-700 outline-none transition focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-100"
                    value={selectedDueFilter}
                    onChange={(event) => {
                        const value = event.target.value;
                        onFilterChange(value === 'ALL' ? [] : [value]);
                    }}
                >
                    {DUE_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <select
                    id="ecdash-course-filter"
                    className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-[12px] font-medium text-zinc-700 outline-none transition focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-100"
                    value={courseFilter}
                    onChange={(event) => {
                        onSelectCourse(event.target.value);
                    }}
                >
                    <option value={courseFilterAllValue}>과목 전체</option>
                    {allCourses.map((courseName) => (
                        <option key={courseName} value={courseName}>
                            {courseName}
                            {newCourseNames.includes(courseName) ? ' *' : ''}
                        </option>
                    ))}
                </select>
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

                {TYPE_FILTER_OPTIONS.map((option) => (
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
