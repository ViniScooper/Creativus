import React, { useState, useEffect } from 'react';
import { MessageSquare, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();
    const [replyingToFeedback, setReplyingToFeedback] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, [token]);

    const fetchFeedbacks = async () => {
        try {
            const response = await fetch('http://26.116.233.104:3000/projects', {
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
                        projectId: p.id,
                        replies: f.replies || []
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

    const handleReplyToFeedback = (feedbackId) => {
        setReplyingToFeedback(feedbackId);
        setReplyContent('');
    };

    const handleSendReply = async () => {
        if (!replyContent.trim()) {
            alert('Digite uma resposta antes de enviar.');
            return;
        }

        setReplyLoading(true);

        try {
            const response = await fetch(`http://26.116.233.104:3000/feedback/${replyingToFeedback}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: replyContent
                })
            });

            if (response.ok) {
                alert('Resposta enviada com sucesso!');
                setReplyingToFeedback(null);
                setReplyContent('');
                // Recarregar feedbacks para mostrar a nova resposta
                fetchFeedbacks();
            } else {
                const errorData = await response.json();
                alert(`Erro ao enviar resposta: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Erro ao enviar resposta:', error);
            alert('Erro ao enviar resposta. Tente novamente.');
        } finally {
            setReplyLoading(false);
        }
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

                                {/* Mostrar respostas existentes */}
                                {item.replies && item.replies.map((reply) => (
                                    <div key={reply.id} style={{ marginTop: '1rem', marginLeft: '2rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{reply.author?.name || 'Você'}</span>
                                            <span className="text-sm text-muted">{formatDate(reply.createdAt)}</span>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', margin: 0 }}>{reply.content}</p>
                                    </div>
                                ))}

                                <div style={{ marginTop: '1.25rem' }}>
                                    <button
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}
                                        onClick={() => handleReplyToFeedback(item.id)}
                                        disabled={replyingToFeedback === item.id && replyLoading}
                                    >
                                        {replyingToFeedback === item.id && replyLoading ? 'Enviando...' : 'Responder'}
                                    </button>

                                    {/* Campo de resposta */}
                                    {replyingToFeedback === item.id && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Sua Resposta:</h4>
                                            <textarea
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Digite sua resposta..."
                                                rows="3"
                                                style={{ width: '100%', marginBottom: '0.5rem' }}
                                                disabled={replyLoading}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                                                    onClick={handleSendReply}
                                                    disabled={replyLoading}
                                                >
                                                    {replyLoading ? 'Enviando...' : 'Enviar Resposta'}
                                                </button>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                                                    onClick={() => {
                                                        setReplyingToFeedback(null);
                                                        setReplyContent('');
                                                    }}
                                                    disabled={replyLoading}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}
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