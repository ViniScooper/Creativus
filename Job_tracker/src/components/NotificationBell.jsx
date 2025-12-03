import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            fetchNotifications();
            // Atualizar notificações a cada 30 segundos
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('http://26.116.233.104:3000/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`http://26.116.233.104:3000/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://26.116.233.104:3000/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        if (notification.projectId) {
            navigate(`/projects/${notification.projectId}`);
            setIsOpen(false);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'PROJECT_APPROVED':
                return '✅';
            case 'FEEDBACK_RECEIVED':
                return '💬';
            case 'PROJECT_REVIEW_REQUESTED':
                return '📋';
            case 'GRADE_PUBLISHED':
                return '📊';
            default:
                return '🔔';
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    color: 'var(--color-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'var(--color-danger)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                        }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998
                        }}
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: '-100px',
                            marginTop: '0.5rem',
                            width: '350px',
                            maxHeight: '500px',
                            backgroundColor: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '1rem',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            zIndex: 999,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid var(--color-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <h4 style={{ margin: 0 }}>Notificações</h4>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--color-primary)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    <CheckCheck size={14} />
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    <p>Nenhuma notificação</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid var(--color-border)',
                                            cursor: 'pointer',
                                            backgroundColor: notification.isRead ? 'transparent' : 'rgba(139, 92, 246, 0.1)',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = notification.isRead
                                                ? 'var(--color-bg-secondary)'
                                                : 'rgba(139, 92, 246, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = notification.isRead
                                                ? 'transparent'
                                                : 'rgba(139, 92, 246, 0.1)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                                    <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: notification.isRead ? 500 : 700 }}>
                                                        {notification.title}
                                                    </h5>
                                                    {!notification.isRead && (
                                                        <span
                                                            style={{
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                backgroundColor: 'var(--color-primary)',
                                                                flexShrink: 0,
                                                                marginTop: '0.25rem'
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                                    {notification.message}
                                                </p>
                                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    {new Date(notification.createdAt).toLocaleString('pt-BR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;

