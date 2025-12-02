import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects } from '../data/mockData';
import { CheckCircle, Upload, MessageSquare, FileText, ChevronRight, ArrowLeft } from 'lucide-react';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const project = projects.find(p => p.id === parseInt(id));
    const [activeTab, setActiveTab] = useState('Briefing');

    if (!project) return <div className="container">Projeto não encontrado</div>;

    const steps = ['Briefing', 'Protótipo', 'Revisão', 'Finalização'];
    const currentStepIndex = steps.indexOf(project.status);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Briefing':
                return (
                    <div className="animate-fade-in">
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h3>Requisitos do Projeto</h3>
                            <p className="text-muted" style={{ marginBottom: '1rem' }}>{project.briefing}</p>
                            <div style={{ padding: '1.5rem', border: '2px dashed var(--color-border)', borderRadius: '1rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                <FileText size={32} className="text-muted" style={{ marginBottom: '0.5rem' }} />
                                <p className="text-sm text-muted">Briefing_Document_v1.pdf</p>
                            </div>
                        </div>
                    </div>
                );
            case 'Protótipo':
                return (
                    <div className="animate-fade-in">
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <h3>Arquivos de Design</h3>
                                <button className="btn btn-primary"><Upload size={18} /> Enviar Nova Versão</button>
                            </div>

                            {project.deliveries.length > 0 ? (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {project.deliveries.map(delivery => (
                                        <div key={delivery.id} style={{ padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '1rem', backgroundColor: 'var(--color-bg)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <strong>{delivery.name}</strong>
                                                <span className="text-sm text-muted">{delivery.date}</span>
                                            </div>
                                            <p className="text-sm text-muted">{delivery.comments}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                    <p>Nenhum protótipo enviado ainda.</p>
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
                            {project.feedback.length > 0 ? (
                                <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                                    {project.feedback.map(fb => (
                                        <div key={fb.id} style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{fb.author}</span>
                                                <span className="text-sm text-muted">{fb.date}</span>
                                            </div>
                                            <p>{fb.content}</p>
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
                    <span className="text-sm font-bold text-muted">{project.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${project.progress}%`,
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
        </div>
    );
};

export default ProjectDetails;
