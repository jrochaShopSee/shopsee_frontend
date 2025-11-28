import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
    maxLength?: number;
}

export function ChatInput({
    onSendMessage,
    disabled = false,
    placeholder = 'Type a message...',
    maxLength = 300
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        const trimmed = message.trim();
        if (trimmed && trimmed.length <= maxLength) {
            onSendMessage(trimmed);
            setMessage('');
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={maxLength}
                        rows={1}
                        className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {message.length}/{maxLength}
                    </div>
                </div>
                <button
                    onClick={handleSend}
                    disabled={disabled || !message.trim() || message.length > maxLength}
                    className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            {disabled && (
                <p className="mt-2 text-center text-sm text-red-600 font-medium">
                    You can't chat with this user
                </p>
            )}
        </div>
    );
}
