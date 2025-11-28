import { User, Ban, AlertTriangle } from 'lucide-react';
import type { ChatUser } from '@/app/types/chat';

interface ChatUserItemProps {
    user: ChatUser;
    isActive: boolean;
    onClick: () => void;
    onBlock: (e: React.MouseEvent) => void;
}

export function ChatUserItem({ user, isActive, onClick, onBlock }: ChatUserItemProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        } catch {
            return dateString;
        }
    };

    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                isActive ? 'bg-purple-50 hover:bg-purple-50' : ''
            }`}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {user.profilePicture && user.profilePicture !== '/img/shopsee_unknown_user.png' ? (
                        <img
                            src={user.profilePicture}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center ring-2 ring-white">
                            <User className="w-6 h-6 text-purple-600" />
                        </div>
                    )}
                    {/* Unread badge */}
                    {user.chatPendingToView > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {user.chatPendingToView > 9 ? '9+' : user.chatPendingToView}
                        </div>
                    )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                            {user.displayName}
                        </p>
                        {user.lastMessageDate && (
                            <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatDate(user.lastMessageDate)}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{user.role}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {!user.active ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                ) : (
                    <button
                        onClick={onBlock}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Block this user"
                    >
                        <Ban className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                    </button>
                )}
            </div>
        </div>
    );
}
