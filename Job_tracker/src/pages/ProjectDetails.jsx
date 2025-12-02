import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Upload, MessageSquare, FileText, ChevronRight, ArrowLeft, Link, File } from 'lucide-react';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState('Briefing');
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showBriefingModal, setShowBriefingModal] = useState(false);
    const [replyingToFeedback, setReplyingToFeedback] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [feedbackReplies, setFeedbackReplies] = useState({}); // Armazenar respostas localmente

    // Buscar projeto específico da API
    useEffect(() => {
        fetchProject();
        // Carregar respostas salvas do localStorage
        const savedReplies = localStorage.getItem(`feedbackReplies_${id}`);
        if (savedReplies) {
            setFeedbackReplies(JSON.parse(savedReplies));
        }
    }, [id, token, refreshKey]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`http://localhost:3000/projects/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('=== PROJECTO CARREGADO ===');
                console.log('Project:', data.title);
                console.log('Deliveries count:', data.deliveries?.length || 0);
                console.log('Deliveries:', data.deliveries);
                setProject(data);
            } else {
                setError('Projeto não encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar projeto:', error);
            setError('Erro ao carregar projeto');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container">Carregando projeto...</div>;
    if (error || !project) return <div className="container">{error || 'Projeto não encontrado'}</div>;

    // Mapear status da API para português
    const mapStatus = (status) => {
        const statusMap = {
            'BRIEFING': 'Briefing',
            'PROTOTYPE': 'Protótipo',
            'REVIEW': 'Revisão',
            'FINALIZATION': 'Finalização'
        };
        return statusMap[status] || status;
    };

    const steps = ['Briefing', 'Protótipo', 'Revisão', 'Finalização'];
    const currentStepIndex = steps.indexOf(mapStatus(project.status));

    const handleNewDelivery = () => {
        console.log('=== BOTÃO CLICADO ===');
        console.log('Abrindo modal de entrega');
        setShowDeliveryModal(true);
    };

    const handleDeliverySuccess = () => {
        console.log('=== NOVA ENTREGA CRIADA ===');
        setRefreshKey(prev => prev + 1); // Forçar re-render
        fetchProject(); // Recarregar projeto
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

        // Salvar resposta localmente
        const newReplies = {
            ...feedbackReplies,
            [replyingToFeedback]: [
                ...(feedbackReplies[replyingToFeedback] || []),
                {
                    id: Date.now().toString(),
                    content: replyContent,
                    author: user?.name || 'Você',
                    createdAt: new Date().toISOString()
                }
            ]
        };

        setFeedbackReplies(newReplies);
        localStorage.setItem(`feedbackReplies_${id}`, JSON.stringify(newReplies));

        alert('Resposta enviada com sucesso!');
        setReplyingToFeedback(null);
        setReplyContent('');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Briefing':
                // Filtrar apenas documentos de briefing (que começam com "Briefing -")
                const briefingDocuments = project.deliveries?.filter(delivery => 
                    delivery.name?.startsWith('Briefing -')
                ) || [];

                return (
                    <div className="animate-fade-in">
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3>Requisitos do Projeto</h3>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setShowBriefingModal(true)}
                                >
                                    <Upload size={18} /> Anexar Documento
                                </button>
                            </div>
                            
                            <p className="text-muted" style={{ marginBottom: '1rem' }}>{project.briefing}</p>
                            
                            {/* Lista de documentos do briefing */}
                            {briefingDocuments.length > 0 ? (
                                <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                                    {briefingDocuments.map((doc, index) => (
                                        <div key={doc.id || index} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-bg)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong>{doc.name}</strong>
                                                    <p className="text-sm text-muted" style={{ margin: '0.2rem 0' }}>
                                                        {new Date(doc.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                                {doc.fileUrl && (
                                                    <div>
                                                        {doc.fileUrl.startsWith('http') ? (
                                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" 
                                                               style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                                                🔗 Abrir Link
                                                            </a>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleDownload(doc)}
                                                                style={{ 
                                                                    padding: '0.3rem 0.6rem', 
                                                                    fontSize: '0.8rem',
                                                                    backgroundColor: 'var(--color-primary)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                ⬇️ Download
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {doc.comments && (
                                                <p className="text-sm" style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
                                                    {doc.comments}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '1.5rem', border: '2px dashed var(--color-border)', borderRadius: '1rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <FileText size={32} className="text-muted" style={{ marginBottom: '0.5rem' }} />
                                    <p className="text-sm text-muted">Nenhum documento anexado ainda.</p>
                                    <p className="text-sm text-muted">Clique em "Anexar Documento" para adicionar arquivos ou links.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'Protótipo':
                // Filtrar apenas entregas (que NÃO começam com "Briefing -")
                const deliveries = project.deliveries?.filter(delivery => 
                    !delivery.name?.startsWith('Briefing -')
                ) || [];

                return (
                    <div className="animate-fade-in">
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <h3>Arquivos de Design</h3>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setShowDeliveryModal(true)}
                                >
                                    <Upload size={18} /> Enviar Nova Versão
                                </button>
                            </div>

                            {deliveries.length > 0 ? (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {deliveries.map((delivery, index) => (
                                        <div key={delivery.id || index} style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '1rem', backgroundColor: 'var(--color-bg)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <strong>{delivery.name}</strong>
                                                <span className="text-sm text-muted">
                                                    {new Date(delivery.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted">{delivery.comments || 'Sem comentários'}</p>
                                            {delivery.fileUrl && (
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    {delivery.fileUrl.startsWith('http') ? (
                                                        <a href={delivery.fileUrl} target="_blank" rel="noopener noreferrer" 
                                                           style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                                            🔗 Abrir Link
                                                        </a>
                                                    ) : (
                                                        <div>
                                                            <span className="text-sm">📄 {delivery.fileUrl}</span>
                                                            <button 
                                                                onClick={() => handleDownload(delivery)}
                                                                style={{ 
                                                                    marginLeft: '1rem', 
                                                                    padding: '0.2rem 0.5rem', 
                                                                    fontSize: '0.8rem',
                                                                    backgroundColor: 'var(--color-primary)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                ⬇️ Download
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                    <p>Nenhuma entrega encontrada.</p>
                                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                        Clique em "Enviar Nova Versão" para fazer sua primeira entrega.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'Revisão':
                return (
                    <div className="animate-fade-in">
                        <div className="card">
                            <h3>Feedback & Comentários</h3>
                            {project.feedbacks && project.feedbacks.length > 0 ? (
                                <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                                    {project.feedbacks.map(fb => (
                                        <div key={fb.id} style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{fb.author.name}</span>
                                                <span className="text-sm text-muted">{new Date(fb.createdAt).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                            <p>{fb.content}</p>
                                            <div style={{ marginTop: '1rem' }}>
                                                <button 
                                                    className="btn btn-outline" 
                                                    style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}
                                                    onClick={() => handleReplyToFeedback(fb.id)}
                                                >
                                                    Responder
                                                </button>
                                            </div>
                                            
                                            {/* Mostrar respostas existentes */}
                                            {feedbackReplies[fb.id] && feedbackReplies[fb.id].map((reply) => (
                                                <div key={reply.id} style={{ marginTop: '1rem', marginLeft: '2rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{reply.author}</span>
                                                        <span className="text-sm text-muted">{new Date(reply.createdAt).toLocaleDateString('pt-BR')}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.95rem', margin: 0 }}>{reply.content}</p>
                                                </div>
                                            ))}
                                            
                                            {/* Campo de resposta */}
                                            {replyingToFeedback === fb.id && (
                                                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Sua Resposta:</h4>
                                                    <textarea
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        placeholder="Digite sua resposta..."
                                                        rows="3"
                                                        style={{ width: '100%', marginBottom: '0.5rem' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button 
                                                            className="btn btn-primary" 
                                                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                                                            onClick={handleSendReply}
                                                        >
                                                            Enviar Resposta
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline" 
                                                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                                                            onClick={() => {
                                                                setReplyingToFeedback(null);
                                                                setReplyContent('');
                                                            }}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted" style={{ marginTop: '1rem', textAlign: 'center', padding: '2rem' }}>Nenhum feedback recebido ainda.</p>
                            )}

                            <div style={{ marginTop: '2rem' }}>
                                <textarea placeholder="Adicione seus comentários..." rows="4"></textarea>
                                <button className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Enviar Feedback</button>
                            </div>
                        </div>
                    </div>
                );
            case 'Finalização':
                return (
                    <div className="animate-fade-in">
                        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem auto'
                            }}>
                                <CheckCircle size={40} color="var(--color-success)" />
                            </div>
                            <h3>Pronto para Entrega?</h3>
                            <p className="text-muted" style={{ marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                                Certifique-se de que todos os arquivos estão finais e aprovados antes de concluir o projeto.
                            </p>
                            <button className="btn btn-primary" style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
                                Concluir Projeto
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // Função para download de arquivos .txt
    const handleDownload = (item) => {
        try {
            // Para arquivos .txt, criamos um blob com conteúdo de exemplo
            // Em um sistema real, você baixaria o arquivo do servidor
            const content = `Entrega: ${item.name}\nComentários: ${item.comments || 'N/A'}\nData: ${new Date(item.createdAt).toLocaleString('pt-BR')}\n\nConteúdo do arquivo seria baixado aqui...`;
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = item.name || 'entrega.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('Download simulado realizado para:', item.name);
        } catch (error) {
            console.error('Erro no download:', error);
            alert('Erro ao fazer download');
        }
    };

    return (
        <div className="animate-fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '1.5rem', border: 'none', paddingLeft: 0, color: 'var(--color-text-muted)' }}>
                <ArrowLeft size={20} /> Voltar para o Início
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1>{project.title}</h1>
                    <p className="text-muted" style={{ fontSize: '1.1rem' }}>{project.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p className="text-sm text-muted">Prazo Final</p>
                    <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>{project.deadline}</h3>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="text-sm font-bold text-muted">Progresso Geral</span>
                    <span className="text-sm font-bold text-muted">{project.progress || 0}%</span>
                </div>
                <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${project.progress || 0}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--color-primary), #ec4899)',
                        borderRadius: '6px',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--color-border)', marginBottom: '2.5rem', gap: '2rem' }}>
                {steps.map((step) => (
                    <button
                        key={step}
                        onClick={() => setActiveTab(step)}
                        style={{
                            padding: '1rem 0',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === step ? '3px solid var(--color-primary)' : '3px solid transparent',
                            color: activeTab === step ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            fontWeight: activeTab === step ? 700 : 500,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            marginBottom: '-2px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {step}
                    </button>
                ))}
            </div>

            {renderTabContent()}

            {/* Modal de Briefing */}
            {showBriefingModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div className="card" style={{
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem'
                        }}>
                            <h2 style={{ margin: 0 }}>Anexar Documento ao Briefing</h2>
                            <button
                                onClick={() => setShowBriefingModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    fontSize: '1.2rem'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <BriefingForm 
                            projectId={project.id}
                            onClose={() => setShowBriefingModal(false)}
                            onSuccess={() => {
                                setShowBriefingModal(false);
                                fetchProject();
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Modal de Entrega */}
            {showDeliveryModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div className="card" style={{
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem'
                        }}>
                            <h2 style={{ margin: 0 }}>Nova Entrega</h2>
                            <button
                                onClick={() => setShowDeliveryModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    fontSize: '1.2rem'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <DeliveryForm 
                            projectId={project.id}
                            onClose={() => setShowDeliveryModal(false)}
                            onSuccess={handleDeliverySuccess}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente para formulário de briefing
const BriefingForm = ({ projectId, onClose, onSuccess }) => {
    const [deliveryType, setDeliveryType] = useState('file');
    const [file, setFile] = useState(null);
    const [link, setLink] = useState('');
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.toLowerCase().endsWith('.txt')) {
                setError('Apenas arquivos .txt são aceitos');
                setFile(null);
                return;
            }
            setError('');
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let name, fileUrl;

            if (deliveryType === 'file' && file) {
                name = `Briefing - ${file.name}`;
                fileUrl = `Arquivo: ${file.name} (${file.size} bytes)`;
            } else if (deliveryType === 'link' && link) {
                name = `Briefing - Link`;
                fileUrl = link;
            } else {
                throw new Error('Selecione um arquivo ou forneça um link');
            }

            console.log('Enviando documento de briefing:', { projectId, name, fileUrl, comments });

            const response = await fetch('http://localhost:3000/deliveries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId,
                    name,
                    comments: comments || 'Documento do briefing',
                    fileUrl
                })
            });

            console.log('Resposta status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Documento criado:', result);
                alert('Documento anexado com sucesso!');
                onSuccess();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}`);
            }
        } catch (err) {
            console.error('Erro:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(248, 113, 113, 0.1)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    color: '#dc2626',
                    marginBottom: '1.5rem'
                }}>
                    {error}
                </div>
            )}

            {/* Tipo de documento */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Tipo de Documento
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="deliveryType"
                            value="file"
                            checked={deliveryType === 'file'}
                            onChange={(e) => setDeliveryType(e.target.value)}
                        />
                        📄 Arquivo .txt
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="deliveryType"
                            value="link"
                            checked={deliveryType === 'link'}
                            onChange={(e) => setDeliveryType(e.target.value)}
                        />
                        🔗 Link
                    </label>
                </div>
            </div>

            {/* Campo de arquivo ou link */}
            {deliveryType === 'file' ? (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Arquivo .txt do Briefing
                    </label>
                    <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                        style={{ marginBottom: 0 }}
                        required
                    />
                    {file && (
                        <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
                            ✅ Arquivo selecionado: {file.name}
                        </p>
                    )}
                </div>
            ) : (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Link do Documento
                    </label>
                    <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://exemplo.com/documento-briefing"
                        required
                        style={{ marginBottom: 0 }}
                    />
                </div>
            )}

            {/* Comentários */}
            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Descrição (opcional)
                </label>
                <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Descreva o documento anexado..."
                    rows="3"
                    style={{ marginBottom: 0 }}
                />
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-outline"
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Anexando...' : 'Anexar Documento'}
                </button>
            </div>
        </form>
    );
};

// Componente separado para o formulário
const DeliveryForm = ({ projectId, onClose, onSuccess }) => {
    const [deliveryType, setDeliveryType] = useState('file');
    const [file, setFile] = useState(null);
    const [link, setLink] = useState('');
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.toLowerCase().endsWith('.txt')) {
                setError('Apenas arquivos .txt são aceitos');
                setFile(null);
                return;
            }
            setError('');
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let name, fileUrl;

            if (deliveryType === 'file' && file) {
                name = file.name;
                fileUrl = `Arquivo: ${file.name} (${file.size} bytes)`;
            } else if (deliveryType === 'link' && link) {
                name = `Link: ${link.substring(0, 50)}...`;
                fileUrl = link;
            } else {
                throw new Error('Selecione um arquivo ou forneça um link');
            }

            console.log('Enviando entrega:', { projectId, name, fileUrl, comments });

            const response = await fetch('http://localhost:3000/deliveries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId,
                    name,
                    comments,
                    fileUrl
                })
            });

            console.log('Resposta status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Entrega criada:', result);
                alert('Entrega enviada com sucesso!');
                onSuccess();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}`);
            }
        } catch (err) {
            console.error('Erro:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(248, 113, 113, 0.1)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    color: '#dc2626',
                    marginBottom: '1.5rem'
                }}>
                    {error}
                </div>
            )}

            {/* Tipo de entrega */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Tipo de Entrega
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="deliveryType"
                            value="file"
                            checked={deliveryType === 'file'}
                            onChange={(e) => setDeliveryType(e.target.value)}
                        />
                        📄 Arquivo .txt
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="deliveryType"
                            value="link"
                            checked={deliveryType === 'link'}
                            onChange={(e) => setDeliveryType(e.target.value)}
                        />
                        🔗 Link
                    </label>
                </div>
            </div>

            {/* Campo de arquivo ou link */}
            {deliveryType === 'file' ? (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Arquivo .txt
                    </label>
                    <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                        style={{ marginBottom: 0 }}
                        required
                    />
                    {file && (
                        <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
                            ✅ Arquivo selecionado: {file.name}
                        </p>
                    )}
                </div>
            ) : (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Link
                    </label>
                    <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://exemplo.com"
                        required
                        style={{ marginBottom: 0 }}
                    />
                </div>
            )}

            {/* Comentários */}
            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Comentários (opcional)
                </label>
                <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Descreva sua entrega..."
                    rows="3"
                    style={{ marginBottom: 0 }}
                />
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-outline"
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Enviando...' : 'Enviar Entrega'}
                </button>
            </div>
        </form>
    );
};

export default ProjectDetails;