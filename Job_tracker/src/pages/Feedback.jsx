import React, { useState, useEffect } from 'react';
import { MessageSquare, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        fetchFeedbacks();
    }, [token]);

    const fetchFeedbacks = async () => {
        try {
            const response = await fetch('http://localhost:3000/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const projects = await response.json();
                
                // Extrair todos os feedbacks dos projetos do usuário
                const allFeedbacks = projects.flatMap(p =>
                    p.feedbacks.map(f => ({ 
                        ...f, 
                        projectTitle: p.title, 
                        projectId: p.id 
                    }))
                );
                
                setFeedbacks(allFeedbacks);
            }
        } catch (error) {
            console.error('Erro ao buscar feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p className="text-muted">Carregando feedbacks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h1>Central de Feedback</h1>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {feedbacks.map((item) => (
                    <div key={item.id} className="card">
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-surface-hover)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <User size={24} color="var(--color-primary)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.author?.name || 'Professor'}</h4>
                                        <span className="text-sm text-muted">em {item.projectTitle}</span>
                                    </div>
                                    <span className="text-sm text-muted">{formatDate(item.createdAt)}</span>
                                </div>
                                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg)', borderRadius: '1rem', position: 'relative', border: '1px solid var(--color-border)' }}>
                                    <MessageSquare size={20} style={{ position: 'absolute', top: '1.5rem', left: '-1rem', color: 'var(--color-border)', backgroundColor: 'var(--color-surface)', borderRadius: '50%' }} />
                                    <p style={{ fontSize: '1.05rem' }}>{item.content}</p>
                                </div>
                                <div style={{ marginTop: '1.25rem' }}>
                                    <button className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>Responder</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {feedbacks.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                            <MessageSquare size={32} className="text-muted" />
                        </div>
                        <p className="text-muted">Nenhuma mensagem de feedback ainda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feedback;