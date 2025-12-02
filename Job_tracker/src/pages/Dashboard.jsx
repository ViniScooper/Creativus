import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, FolderKanban, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NewProjectModal from '../components/NewProjectModal';

const Dashboard = () => {
    const [filter, setFilter] = useState('Todos');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, token } = useAuth();

    // Buscar projetos da API
    useEffect(() => {
        fetchProjects();
    }, [token]);

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:3000/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Erro ao buscar projetos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectCreated = (newProject) => {
        setProjects([newProject, ...projects]);
        fetchProjects(); // Atualizar lista
    };

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

    const filteredProjects = filter === 'Todos'
        ? projects
        : projects.filter(p => mapStatus(p.status) === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Finalização': return 'badge-success';
            case 'Revisão': return 'badge-warning';
            case 'Protótipo': return 'badge-info';
            default: return 'badge-danger'; // Briefing ou atrasado
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1>Olá, {user?.name}! 👋</h1>
                    <p className="text-muted">Bem-vindo ao Creativus. Aqui está o resumo de hoje.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    Novo Projeto
                </button>
            </header>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-muted text-sm">Total de Projetos</p>
                            <h3>{projects.length}</h3>
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
                            <h3>{projects.filter(p => p.status !== 'FINALIZATION').length}</h3>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '1rem', color: 'var(--color-warning)' }}>
                            <Clock size={24} />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-muted text-sm">Concluídos</p>
                            <h3>{projects.filter(p => p.status === 'FINALIZATION').length}</h3>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem', color: 'var(--color-success)' }}>
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects List */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3>Projetos Recentes</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['Todos', 'Briefing', 'Protótipo', 'Revisão', 'Finalização'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`btn ${filter === status ? 'btn-primary' : 'btn-outline'}`}
                                style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: '2rem' }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredProjects.map(project => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.5rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: '1rem',
                                backgroundColor: 'var(--color-bg)',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                color: 'inherit'
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
                            <div style={{ flex: 1 }}>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{project.title}</h4>
                                <p className="text-muted text-sm">{project.description}</p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`badge ${getStatusColor(mapStatus(project.status))}`}>
                                        {mapStatus(project.status)}
                                    </span>
                                    <p className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>
                                        Prazo: {project.deadline}
                                    </p>
                                </div>

                                <div className="btn btn-outline" style={{ borderRadius: '50%', padding: '0.75rem', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </Link>
                    ))}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                            Carregando projetos...
                        </div>
                    )}
                    {!loading && filteredProjects.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                            Nenhum projeto encontrado com este status.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Novo Projeto */}
            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />
        </div>
    );
};

export default Dashboard;
