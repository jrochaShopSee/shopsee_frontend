"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as signalR from '@microsoft/signalr';
import { ChatApi } from '@/app/services/chatApi';
import type { ChatUser, ChatMessage } from '@/app/types/chat';
import { ChatUserItem } from '@/app/components/chat/ChatUserItem';
import { ChatMessageItem } from '@/app/components/chat/ChatMessageItem';
import { ChatInput } from '@/app/components/chat/ChatInput';
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner';
import { Search, MessageSquare, UserPlus, ArrowLeft, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { rootUrl } from '@/app/utils/host';

export default function ChatPage() {
    const router = useRouter();
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [lastMessageId, setLastMessageId] = useState<number | null>(null);
    const [connectionState, setConnectionState] = useState<string>('Disconnected');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const currentUserRef = useRef<string>('');
    const isInitialLoadRef = useRef(true);

    // Scroll to bottom of messages
    const scrollToBottom = (smooth = false) => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
        }
    };

    // Load user connections
    const loadUserConnections = useCallback(async () => {
        try {
            setIsLoading(true);
            const connections = await ChatApi.getUserConnections();
            // Sort by active first, then by last message date
            const sortedConnections = connections.sort((a, b) => {
                if (a.active !== b.active) return a.active ? -1 : 1;
                if (!a.lastMessageDate) return 1;
                if (!b.lastMessageDate) return -1;
                return new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();
            });
            setUsers(sortedConnections);
            setFilteredUsers(sortedConnections);
        } catch (error) {
            console.error('Failed to load connections:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to load connections');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load chat history
    const loadChatHistory = useCallback(async (username: string, page: number, lastPoint: number | null = null) => {
        try {
            if (page === 0) {
                setIsLoadingMessages(true);
            } else {
                setIsLoadingMore(true);
            }

            const response = await ChatApi.getChatHistory({
                username,
                page,
                lastPoint
            });

            if (page === 0) {
                setMessages(response.chatMessages.reverse());
                setCurrentPage(0);
                setHasMore(response.chatMessages.length >= 30);
                if (response.chatMessages.length > 0) {
                    setLastMessageId(response.chatMessages[response.chatMessages.length - 1].id);
                }
            } else {
                setMessages(prev => [...response.chatMessages.reverse(), ...prev]);
                setHasMore(response.chatMessages.length >= 30);
                if (response.chatMessages.length > 0) {
                    setLastMessageId(response.chatMessages[response.chatMessages.length - 1].id);
                }
            }

            // Update viewed status via SignalR
            if (connectionRef.current && response.updatedViewedStatusChatIds.length > 0) {
                try {
                    await connectionRef.current.invoke('UpdateViewedStatusOnOtherUser', response.updatedViewedStatusChatIds, username);
                } catch (err) {
                    console.error('Failed to update viewed status:', err);
                }
            }

        } catch (error) {
            console.error('Failed to load chat history:', error);
            toast.error('Failed to load chat history');
        } finally {
            setIsLoadingMessages(false);
            setIsLoadingMore(false);
        }
    }, []);

    // Setup SignalR connection
    useEffect(() => {
        console.log('[SignalR] Starting connection setup...');
        const hubUrl = `${rootUrl}/livechat`;
        console.log('[SignalR] Hub URL:', hubUrl);

        // Helper function to get JWT token from cookie
        const getCookie = (name: string): string | null => {
            if (typeof document === "undefined") return null;
            const nameEQ = name + "=";
            const ca = document.cookie.split(";");
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === " ") c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        };

        const token = getCookie("access_token");
        console.log('[SignalR] Token found:', token ? 'YES' : 'NO');

        // Use JWT authentication - token goes in Authorization header and query string
        // withCredentials must be false since we're using JWT, not cookies
        const options: signalR.IHttpConnectionOptions = {
            accessTokenFactory: () => {
                const token = getCookie("access_token");
                console.log('[SignalR] accessTokenFactory called, returning token:', token ? 'YES' : 'NO');
                return token || "";
            },
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
            withCredentials: false  // Important: false because we're using JWT, not cookies
        };

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, options)
            .configureLogging(signalR.LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        // Connection lifecycle handlers
        connection.onclose((error) => {
            console.log('[SignalR] Connection closed', error);
            setConnectionState('Disconnected');
            if (error) {
                console.error('[SignalR] Connection closed with error:', error);
                toast.error('Connection lost. Attempting to reconnect...');
            }
        });

        connection.onreconnecting((error) => {
            console.log('[SignalR] Reconnecting...', error);
            setConnectionState('Reconnecting');
            toast.info('Reconnecting to chat server...');
        });

        connection.onreconnected((connectionId) => {
            console.log('[SignalR] Reconnected successfully', connectionId);
            setConnectionState('Connected');
            toast.success('Reconnected to chat server');
        });

        // Handle incoming messages from other users
        connection.on('ReceiveMessage', (data: ChatMessage) => {
            console.log('[SignalR] ReceiveMessage:', data);

            setMessages(prev => [...prev, data]);
            setTimeout(() => scrollToBottom(true), 100);

            // Update date in user list
            setUsers(prev => prev.map(u =>
                u.username === data.sentUsername
                    ? { ...u, lastMessageDate: data.messageDate }
                    : u
            ));
        });

        // Handle confirmation of sent messages (with real database data)
        connection.on('MessageSent', (data: ChatMessage) => {
            console.log('[SignalR] MessageSent:', data);

            // Replace the optimistic message with the real one from database
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== -1); // Remove optimistic message
                return [...filtered, data];
            });
            setTimeout(() => scrollToBottom(true), 100);
        });

        // Start connection with detailed error logging
        setConnectionState('Connecting');
        connection.start()
            .then(() => {
                console.log('[SignalR] Connected successfully');
                console.log('[SignalR] Connection ID:', connection.connectionId);
                console.log('[SignalR] Connection State:', connection.state);
                setConnectionState('Connected');
            })
            .catch(err => {
                console.error('[SignalR] Connection error:', err);
                console.error('[SignalR] Error details:', {
                    message: err.message,
                    stack: err.stack,
                    connectionState: connection.state
                });
                setConnectionState('Disconnected');
                toast.error('Failed to connect to chat server. Please refresh the page.');
            });

        return () => {
            connection.stop();
        };
    }, []);

    // Load connections on mount
    useEffect(() => {
        loadUserConnections();
    }, [loadUserConnections]);

    // Handle search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(u =>
                u.displayName.toLowerCase().includes(query) ||
                u.role.toLowerCase().includes(query)
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    // Handle user selection
    const handleSelectUser = useCallback((user: ChatUser) => {
        setSelectedUser(user);
        currentUserRef.current = user.username;
        setMessages([]);
        setCurrentPage(0);
        setHasMore(true);
        setLastMessageId(null);
        isInitialLoadRef.current = true;
        loadChatHistory(user.username, 0);

        // Clear notifications
        setUsers(prev => prev.map(u =>
            u.id === user.id ? { ...u, chatPendingToView: 0 } : u
        ));
    }, [loadChatHistory]);

    // Handle sending message
    const handleSendMessage = useCallback(async (message: string) => {
        if (!selectedUser || !connectionRef.current) {
            console.error('[SendMessage] Missing selectedUser or connection');
            toast.error('Not connected to chat server');
            return;
        }

        const currentState = connectionRef.current.state;
        console.log('[SendMessage] Connection state:', currentState);

        if (currentState !== signalR.HubConnectionState.Connected) {
            console.error('[SendMessage] Connection not in Connected state:', currentState);
            toast.error('Not connected to chat server. Please wait for reconnection.');
            return;
        }

        try {
            console.log('[SendMessage] Invoking SendMessage', { message, to: selectedUser.username });

            // Optimistically add message to UI (will be replaced by real message from database)
            const tempMessage: ChatMessage = {
                id: -1, // Special ID to identify optimistic message
                message: message,
                sentUsername: 'You',
                sentDisplayname: 'You',
                sentProfilePicture: '',
                receiverDisplayname: selectedUser.displayName,
                viewed: false,
                messageDate: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempMessage]);
            setTimeout(() => scrollToBottom(true), 100);

            // Send via SignalR - will receive MessageSent with real data
            await connectionRef.current.invoke('SendMessage', selectedUser.username, message);
            console.log('[SendMessage] Message sent successfully');
        } catch (error) {
            console.error('[SendMessage] Failed to send message:', error);
            console.error('[SendMessage] Error details:', {
                error,
                connectionState: connectionRef.current.state,
                connectionId: connectionRef.current.connectionId
            });
            toast.error('Failed to send message. Please try again.');
        }
    }, [selectedUser]);

    // Handle block/unblock user
    const handleBlockUser = useCallback(async (e: React.MouseEvent, user: ChatUser) => {
        e.stopPropagation();

        try {
            const response = await ChatApi.blockOrUnblockUser({ userId: user.id });
            toast.success(response.message);

            // Reload connections
            await loadUserConnections();

            // If this was the selected user, update their status
            if (selectedUser?.id === user.id) {
                setSelectedUser(prev => prev ? { ...prev, active: !prev.active } : null);
            }
        } catch (error) {
            console.error('Failed to block/unblock user:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to block/unblock user');
        }
    }, [loadUserConnections, selectedUser]);

    // Handle infinite scroll
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || isLoadingMore || !hasMore || !selectedUser) return;

        const { scrollTop } = messagesContainerRef.current;

        if (scrollTop <= 100 && hasMore) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            loadChatHistory(selectedUser.username, newPage, lastMessageId);
        }
    }, [isLoadingMore, hasMore, selectedUser, currentPage, lastMessageId, loadChatHistory]);

    // Scroll to bottom on initial load
    useEffect(() => {
        if (messages.length > 0 && isInitialLoadRef.current) {
            setTimeout(() => {
                scrollToBottom(false);
                isInitialLoadRef.current = false;
            }, 100);
        }
    }, [messages]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="h-screen flex flex-col max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                                    <MessageSquare className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                            connectionState === 'Connected'
                                                ? 'bg-green-100 text-green-700'
                                                : connectionState === 'Connecting' || connectionState === 'Reconnecting'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {connectionState}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {users.length} {users.length === 1 ? 'connection' : 'connections'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/cms/admin/network')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span className="hidden sm:inline">Add Connections</span>
                        </button>
                    </div>
                </div>

                {/* Main chat area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Users list */}
                    <div className="w-full sm:w-80 lg:w-96 flex flex-col bg-white border-r border-gray-200">
                        {/* Search */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Users */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <ChatUserItem
                                        key={user.id}
                                        user={user}
                                        isActive={selectedUser?.id === user.id}
                                        onClick={() => handleSelectUser(user)}
                                        onBlock={(e) => handleBlockUser(e, user)}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <Users className="w-16 h-16 text-gray-300 mb-4" />
                                    <p className="text-gray-600 font-semibold mb-2">
                                        {searchQuery ? 'No users found' : 'No connections yet'}
                                    </p>
                                    {!searchQuery && (
                                        <button
                                            onClick={() => router.push('/cms/admin/network')}
                                            className="text-purple-600 hover:text-purple-700 font-medium"
                                        >
                                            Start connecting
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat area */}
                    <div className="flex-1 flex flex-col bg-white">
                        {selectedUser ? (
                            <>
                                {/* Chat header */}
                                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                                    <div className="flex items-center gap-3">
                                        {selectedUser.profilePicture && selectedUser.profilePicture !== '/img/shopsee_unknown_user.png' ? (
                                            <img
                                                src={selectedUser.profilePicture}
                                                alt={selectedUser.displayName}
                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center ring-2 ring-white shadow-sm">
                                                <Users className="w-6 h-6 text-purple-600" />
                                            </div>
                                        )}
                                        <div>
                                            <h2 className="font-bold text-gray-900">{selectedUser.displayName}</h2>
                                            <p className="text-sm text-gray-600">{selectedUser.role}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div
                                    ref={messagesContainerRef}
                                    onScroll={handleScroll}
                                    className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-white"
                                >
                                    {isLoadingMore && (
                                        <div className="flex justify-center mb-4">
                                            <LoadingSpinner size="sm" />
                                        </div>
                                    )}
                                    {isLoadingMessages ? (
                                        <div className="flex items-center justify-center h-full">
                                            <LoadingSpinner size="md" />
                                        </div>
                                    ) : messages.length > 0 ? (
                                        <>
                                            {messages.map((message) => (
                                                <ChatMessageItem
                                                    key={message.id}
                                                    message={message}
                                                    isOwnMessage={message.sentUsername !== selectedUser.username}
                                                />
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-600 font-semibold">No messages yet</p>
                                                <p className="text-sm text-gray-500 mt-1">Start the conversation</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input */}
                                <ChatInput
                                    onSendMessage={handleSendMessage}
                                    disabled={!selectedUser.active}
                                    placeholder={selectedUser.active ? 'Type a message...' : 'Cannot send messages'}
                                />
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                                <div className="text-center">
                                    <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                    <p className="text-xl font-semibold text-gray-600 mb-2">
                                        Select a conversation
                                    </p>
                                    <p className="text-gray-500">
                                        Choose a user from the list to start chatting
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
