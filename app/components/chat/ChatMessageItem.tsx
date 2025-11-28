import { Check, CheckCheck, User } from 'lucide-react';
import type { ChatMessage } from '@/app/types/chat';

interface ChatMessageItemProps {
    message: ChatMessage;
    isOwnMessage: boolean;
}

export function ChatMessageItem({ message, isOwnMessage }: ChatMessageItemProps) {
    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } catch {
            return dateString;
        }
    };

    const formatMessageText = (text: string) => {
        // Convert newlines to <br> tags for display
        return text.split('\n').map((line, i) => (
            <span key={i}>
                {line}
                {i < text.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    if (isOwnMessage) {
        return (
            <div className="flex justify-end mb-4 group">
                <div className="flex flex-col items-end max-w-[70%]">
                    <div className="flex items-end gap-2">
                        <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
                            <p className="text-sm break-words whitespace-pre-wrap">
                                {formatMessageText(message.message)}
                            </p>
                        </div>
                        {message.sentProfilePicture && message.sentProfilePicture !== '/img/shopsee_unknown_user.png' ? (
                            <img
                                src={message.sentProfilePicture}
                                alt={message.sentDisplayname}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-purple-600" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 mr-10 text-xs text-gray-500">
                        {message.viewed ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : (
                            <Check className="w-3 h-3" />
                        )}
                        <span>{formatTime(message.messageDate)}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start mb-4 group">
            <div className="flex flex-col items-start max-w-[70%]">
                <div className="flex items-end gap-2">
                    {message.sentProfilePicture && message.sentProfilePicture !== '/img/shopsee_unknown_user.png' ? (
                        <img
                            src={message.sentProfilePicture}
                            alt={message.sentDisplayname}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-600" />
                        </div>
                    )}
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                        <p className="text-sm text-gray-900 break-words whitespace-pre-wrap">
                            {formatMessageText(message.message)}
                        </p>
                    </div>
                </div>
                <span className="text-xs text-gray-500 mt-1 ml-10">
                    {formatTime(message.messageDate)}
                </span>
            </div>
        </div>
    );
}
