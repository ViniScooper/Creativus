import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Send, MessageSquare, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Início' },
        { path: '/projects', icon: FolderKanban, label: 'Projetos' },
        { path: '/deliveries', icon: Send, label: 'Entregas' },
        { path: '/feedback', icon: MessageSquare, label: 'Feedback' },
        { path: '/profile', icon: User, label: 'Perfil' },
    ];

    if (user?.role === 'TEACHER') {
        navItems.push({ path: '/admin', icon: Settings, label: 'Admin' });
    }

    return (
        <aside className="sidebar">
            <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(139, 92, 246, 0.4)'
                }}>
                    <LayoutDashboard color="white" size={24} />
                </div>
                <h2 style={{ fontSize: '1.5rem', margin: 0, background: 'linear-gradient(to right, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Creativus
                </h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `btn ${isActive ? 'btn-primary' : 'btn-outline'}`
                        }
                        style={({ isActive }) => ({
                            justifyContent: 'flex-start',
                            border: isActive ? 'none' : '1px solid transparent',
                            backgroundColor: isActive ? '' : 'transparent',
                            color: isActive ? 'white' : 'var(--color-text-muted)',
                            padding: '0.875rem 1.25rem'
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} color={isActive ? 'white' : 'currentColor'} />
                                <span style={{ color: isActive ? 'white' : 'inherit' }}>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                {/* User info */}
                <div style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-bg)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem'
                }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{user?.name}</div>
                    <div className="text-sm text-muted">{user?.email}</div>
                    <div style={{
                        marginTop: '0.5rem',
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: user?.role === 'TEACHER' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                        color: user?.role === 'TEACHER' ? 'var(--color-primary)' : 'var(--color-success)',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                    }}>
                        {user?.role === 'TEACHER' ? '👨‍🏫 Professor' : '📚 Aluno'}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="btn btn-outline"
                    style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        border: 'none',
                        color: 'var(--color-danger)'
                    }}
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
