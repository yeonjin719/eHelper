import {
    MdOutlineAssignment,
    MdOutlineCampaign,
    MdOutlineFolderOpen,
    MdOutlineForum,
    MdOutlinePlayCircleOutline,
    MdOutlineQuiz,
} from 'react-icons/md';
import type { DashboardItem } from '../../types';

interface TypeBadgeIconProps {
    type: DashboardItem['type'];
}

export function TypeBadgeIcon({ type }: TypeBadgeIconProps) {
    if (type === 'ASSIGNMENT')
        return <MdOutlineAssignment aria-hidden="true" />;
    if (type === 'QUIZ') return <MdOutlineQuiz aria-hidden="true" />;
    if (type === 'LECTURE')
        return <MdOutlinePlayCircleOutline aria-hidden="true" />;
    if (type === 'FORUM') return <MdOutlineForum aria-hidden="true" />;
    if (type === 'RESOURCE') return <MdOutlineFolderOpen aria-hidden="true" />;
    return <MdOutlineCampaign aria-hidden="true" />;
}
