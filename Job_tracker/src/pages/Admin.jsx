import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Users, TrendingUp, FolderKanban, MessageSquare, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const { user, token } = useAuth();
    const { error } = useToast();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalFeedbacks: 0,
        totalDeliveries: 0
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar se é professor
        if (user?.role !== 'TEACHER') {
            error('Acesso negado. Apenas professores podem acessar esta página.');
            navigate('/');
            return;
        }

        fetchAdminData();
    }, [user, token]);

    const fetchAdminData = async () => {
        try {
            // Buscar projetos
            const projectsResponse = await fetch('http://localhost:3000/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (projectsResponse.ok) {
                const projects = await projectsResponse.json();

                // Calcular estatísticas
                const uniqueStudents = new Set(projects.map(p => p.studentId)).size;
                const activeProjects = projects.filter(p => p.status !== 'FINALIZATION').length;
                const completedProjects = projects.filter(p => p.status === 'FINALIZATION').length;
                const totalFeedbacks = projects.reduce((sum, p) => sum + (p.feedbacks?.length || 0), 0);
                const totalDeliveries = projects.reduce((sum, p) => sum + (p.deliveries?.length || 0), 0);

                setStats({
                    totalStudents: uniqueStudents,
                    totalProjects: projects.length,
                    activeProjects,
                    completedProjects,
                    totalFeedbacks,
                    totalDeliveries
                });

                // Projetos recentes (últimos 5)
                setRecentProjects(projects.slice(0, 5));
            }
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            error('Erro ao carregar dados do painel');
        } finally {
            setLoading(false);
        }
    };

    const mapStatus = (status) => {
        const statusMap = {
            'BRIEFING': 'Briefing',
            'PROTOTYPE': 'Protótipo',
            'REVIEW': 'Revisão',
            'FINALIZATION': 'Finalização'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'FINALIZATION': return 'badge-success';
            case 'REVIEW': return 'badge-warning';
            case 'PROTOTYPE': return 'badge-info';
            default: return 'badge-danger';
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p className="text-muted">Carregando painel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2.5rem' }}>
                <h1>Painel Administrativo</h1>
                <p className="text-muted">Visão geral de projetos e estatísticas</p>
            </header>

            {/* Estatísticas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-muted text-sm">Total de Alunos</p>
                            <h2 style={{ margin: '0.5rem 0 0 0' }}>{stats.totalStudents}</h2>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem', color: '#3b82f6' }}>
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-muted text-sm">Total de Projetos</p>
                            <h2 style={{ margin: '0.5rem 0 0 0' }}>{stats.totalProjects}</h2>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '1rem', color: 'var(--color-primary)' }}>
                            <FolderKanban size={24} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-muted text-sm">Em Andamento</p>
                            <h2 style={{ margin: '0.5rem 0 0 0' }}>{stats.activeProjects}</h2>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '1rem', color: 'var(--color-warning)' }}>
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-muted text-sm">Concluídos</p>
                            <h2 style={{ margin: '0.5rem 0 0 0' }}>{stats.completedProjects}</h2>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem', color: 'var(--color-success)' }}>
                            <Calendar size={24} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-muted text-sm">Feedbacks Enviados</p>
                            <h2 style={{ margin: '0.5rem 0 0 0' }}>{stats.totalFeedbacks}</h2>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(236, 72, 153, 0.1)', borderRadius: '1rem', color: '#ec4899' }}>
                            <MessageSquare size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Projetos Recentes */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Projetos Recentes</h3>

                {recentProjects.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {recentProjects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => navigate(`/projects/${project.id}`)}
                                style={{
                                    padding: '1.5rem',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: 'var(--color-bg)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{project.title}</h4>
                                        <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0 0' }}>
                                            👤 {project.student?.name}
                                        </p>
                                    </div>
                                    <span className={`badge ${getStatusColor(project.status)}`}>
                                        {mapStatus(project.status)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                                    <div>
                                        <p className="text-sm text-muted" style={{ margin: 0 }}>Progresso</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{project.progress || 0}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted" style={{ margin: 0 }}>Entregas</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{project.deliveries?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted" style={{ margin: 0 }}>Feedbacks</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{project.feedbacks?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted" style={{ margin: 0 }}>Prazo</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{project.deadline}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                        <p>Nenhum projeto encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
