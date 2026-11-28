import UserAvatar from '@/components/ui/user-avatar';
import type { Person } from '@/components/reports/types';
export default function PersonLine({ person }: { person: Person }) {
    return (
        <span className="flex items-center gap-2.5">
            <UserAvatar
                name={person.name}
                avatar={person.avatar}
                className="size-8 text-badge"
            />
            <span className="flex flex-col">
                <strong>{person.name}</strong>
                <span className="text-caption text-text-secondary">
                    @{person.username}
                </span>
            </span>
        </span>
    );
}
