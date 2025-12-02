import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, User, GraduationCap, BookOpen } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'STUDENT'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await login(formData.email, formData.password);
            } else {
                result = await register(formData.email, formData.password, formData.name, formData.role);
            }

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Erro ao autenticar');
            }
        } catch (err) {
            setError('Erro ao processar requisição');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #13141f 0%, #1c1e2e 50%, #13141f 100%)',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decorations */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)'
            }}></div>

            <div className="card animate-fade-in" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '3rem',
                position: 'relative',
                zIndex: 1,
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(28, 30, 46, 0.9)'
            }}>
                {/* Logo/Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)'
                    }}>
                        <BookOpen size={40} color="white" />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        Creativus
                    </h1>
                    <p className="text-muted">
                        {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
                    </p>
                </div>

                {/* Toggle Login/Register */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                    backgroundColor: 'var(--color-bg)',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-lg)'
                }}>
                    <button
                        onClick={() => {
                            setIsLogin(true);
                            setError('');
                        }}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isLogin ? 'var(--color-primary)' : 'transparent',
                            color: isLogin ? 'white' : 'var(--color-text-muted)',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => {
                            setIsLogin(false);
                            setError('');
                        }}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: !isLogin ? 'var(--color-primary)' : 'transparent',
                            color: !isLogin ? 'white' : 'var(--color-text-muted)',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        Registrar
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid var(--color-danger)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-danger)',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                <User size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Seu nome"
                                required={!isLogin}
                                style={{ marginBottom: 0 }}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <Mail size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="seu@email.com"
                            required
                            style={{ marginBottom: 0 }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <Lock size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Senha
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            style={{ marginBottom: 0 }}
                        />
                    </div>

                    {!isLogin && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Perfil
                            </label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{
                                    flex: 1,
                                    padding: '1rem',
                                    border: `2px solid ${formData.role === 'STUDENT' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="STUDENT"
                                        checked={formData.role === 'STUDENT'}
                                        onChange={handleChange}
                                        style={{ display: 'none' }}
                                    />
                                    <GraduationCap size={24} style={{ marginBottom: '0.5rem', color: formData.role === 'STUDENT' ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                                    <div style={{ fontWeight: 600, color: formData.role === 'STUDENT' ? 'var(--color-primary)' : 'inherit' }}>Aluno</div>
                                </label>
                                <label style={{
                                    flex: 1,
                                    padding: '1rem',
                                    border: `2px solid ${formData.role === 'TEACHER' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="TEACHER"
                                        checked={formData.role === 'TEACHER'}
                                        onChange={handleChange}
                                        style={{ display: 'none' }}
                                    />
                                    <BookOpen size={24} style={{ marginBottom: '0.5rem', color: formData.role === 'TEACHER' ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                                    <div style={{ fontWeight: 600, color: formData.role === 'TEACHER' ? 'var(--color-primary)' : 'inherit' }}>Professor</div>
                                </label>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            marginTop: '1rem',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? (
                            'Processando...'
                        ) : (
                            <>
                                <LogIn size={20} />
                                {isLogin ? 'Entrar' : 'Criar Conta'}
                            </>
                        )}
                    </button>
                </form>

                {/* Demo credentials */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    <p className="text-sm text-muted" style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
                        🎯 Contas de demonstração:
                    </p>
                    <p className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>
                        📚 Aluno: aluno@teste.com / 123456
                    </p>
                    <p className="text-sm text-muted">
                        👨‍🏫 Professor: professor@teste.com / 123456
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
