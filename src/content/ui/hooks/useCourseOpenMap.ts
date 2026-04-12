import { useEffect, useState } from 'react';
import type { DashboardItem } from '../types';

export function useCourseOpenMap(groupEntries: Array<[string, DashboardItem[]]>) {
    const [courseOpenMap, setCourseOpenMap] = useState<Record<string, boolean>>(
        {},
    );

    useEffect(() => {
        const groupNames = groupEntries.map(([courseName]) => courseName);
        setCourseOpenMap((prev) => {
            let changed = false;
            const next: Record<string, boolean> = {};

            for (const courseName of groupNames) {
                if (Object.prototype.hasOwnProperty.call(prev, courseName)) {
                    next[courseName] = prev[courseName];
                } else {
                    next[courseName] = true;
                    changed = true;
                }
            }

            for (const prevKey of Object.keys(prev)) {
                if (!groupNames.includes(prevKey)) {
                    changed = true;
                    break;
                }
            }

            return changed ? next : prev;
        });
    }, [groupEntries]);

    return { courseOpenMap, setCourseOpenMap };
}
