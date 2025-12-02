import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Mail, Lock, Save } from 'lucide-react';

const Profile = () => {
    const { user, token, updateUser } = useAuth();
    const { success, error } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });

    React.useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email
                })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                updateUser(updatedUser);
                success('Perfil atualizado com sucesso!');
                setIsEditing(false);
            } else {
                const errorData = await response.json();
                error(errorData.error || 'Erro ao atualizar perfil');
            }
        } catch (err) {
            console.error('Erro ao atualizar perfil:', err);
            error('Erro ao atualizar perfil. Tente novamente.');
            console.error('Erro detalhado ao atualizar perfil:', err);
            console.error('Status da resposta:', err.response?.status);
            console.error('Token presente:', !!token);
            console.error('URL da API:', 'http://localhost:3000/profile');
            console.error('Dados enviados:', {
                name: formData.name,
                email: formData.email
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            error('As senhas não coincidem');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/profile/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (response.ok) {
                success('Senha alterada com sucesso!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                const errorData = await response.json();
                error(errorData.error || 'Erro ao alterar senha');
            }
        } catch (err) {
            console.error('Erro ao alterar senha:', err);
            error('Erro ao alterar senha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <h1>Meu Perfil</h1>
            <p className="text-muted" style={{ marginBottom: '2.5rem' }}>
                Gerencie suas informações pessoais e configurações de conta
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Informações do Perfil */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3>Informações Pessoais</h3>
                        {!isEditing && (
                            <button
                                className="btn btn-outline"
                                onClick={() => setIsEditing(true)}
                            >
                                Editar
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={!isEditing}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={!isEditing}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Tipo de Conta
                            </label>
                            <div style={{
                                padding: '0.75rem 1rem',
                                backgroundColor: user?.role === 'TEACHER' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '0.5rem',
                                color: user?.role === 'TEACHER' ? 'var(--color-primary)' : '#3b82f6',
                                fontWeight: 600
                            }}>
                                {user?.role === 'TEACHER' ? '👨‍🏫 Professor' : '👨‍🎓 Aluno'}
                            </div>
                        </div>

                        {isEditing && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    <Save size={18} />
                                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: user?.name || '',
                                            email: user?.email || ''
                                        });
                                    }}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Alterar Senha */}
                <div className="card">
                    <h3 style={{ marginBottom: '2rem' }}>
                        <Lock size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Alterar Senha
                    </h3>

                    <form onSubmit={handleChangePassword}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Senha Atual
                            </label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                placeholder="Digite sua senha atual"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                placeholder="Digite sua nova senha"
                                required
                                minLength={6}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Confirmar Nova Senha
                            </label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                placeholder="Confirme sua nova senha"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Alterando...' : 'Alterar Senha'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
