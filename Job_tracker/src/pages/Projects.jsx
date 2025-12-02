import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, ArrowRight, Search, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const { token, user } = useAuth(); // Adicione user aqui

    // Adicione debug no useEffect
    useEffect(() => {
        console.log('=== DEBUG USER ===');
        console.log('User:', user);
        console.log('User role:', user?.role);
        console.log('Is teacher:', user?.role === 'TEACHER');
        fetchProjects();
    }, [token, user]);

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:3000/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('=== DEBUG PROJECTS ===');
                console.log('Projects received:', data.length);
                console.log('First project:', data[0]);
                console.log('First project student:', data[0]?.student);
                setProjects(data);
            }
        } catch (error) {
            console.error('Erro ao buscar projetos:', error);
        } finally {
            setLoading(false);
        }
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

    const filteredProjects = projects.filter(p => {
        const projectStatus = mapStatus(p.status);
        const matchesStatus = filter === 'Todos' || projectStatus === filter;
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Finalização': return 'badge-success';
            case 'Revisão': return 'badge-warning';
            case 'Protótipo': return 'badge-info';
            default: return 'badge-danger';
        }
    };

    const handleDelete = async (projectId, e) => {
        e.preventDefault();
        
        console.log('=== DEBUG DELETE ===');
        console.log('Project ID:', projectId);
        console.log('Type:', typeof projectId);
        
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null');
        
        if (!token) {
            alert('Token não encontrado. Faça login novamente.');
            return;
        }
        
        if (!confirm('Deletar projeto?')) return;
        
        try {
            const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (response.ok) {
                setProjects(projects.filter(p => p.id !== projectId));
                alert('Deletado com sucesso!');
            } else {
                const error = await response.text();
                console.log('Error response:', error);
                alert(`Erro ${response.status}: ${error}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Erro de conexão: ' + error.message);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1>Todos os Projetos</h1>
                    <p className="text-muted">Gerencie e acompanhe todos os seus projetos</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                        <Search
                            size={20}
                            style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Buscar projetos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                paddingLeft: '3rem',
                                marginBottom: 0
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['Todos', 'Briefing', 'Protótipo', 'Revisão', 'Finalização'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`btn ${filter === status ? 'btn-primary' : 'btn-outline'}`}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', borderRadius: '2rem' }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1 / -1' }}>
                        <p className="text-muted">Carregando projetos...</p>
                    </div>
                ) : (
                    filteredProjects.map(project => {
                        console.log('=== DEBUG PROJECT CARD ===');
                        console.log('Project:', project.title);
                        console.log('Project student:', project.student);
                        console.log('User role check:', user?.role === 'TEACHER');
                        
                        return (
                            <div key={project.id} style={{ position: 'relative' }}>
                                <Link
                                    to={`/projects/${project.id}`}
                                    className="card"
                                    style={{
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '1.5rem',
                                        paddingBottom: '1.5rem',
                                        borderBottom: '1px solid var(--color-border)'
                                    }}>
                                        <div style={{
                                            padding: '0.75rem',
                                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                            borderRadius: '0.75rem',
                                            color: 'var(--color-primary)'
                                        }}>
                                            <FolderKanban size={24} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{project.title}</h3>
                                            {/* Mostrar informações do estudante apenas para professores */}
                                            {user?.role === 'TEACHER' && project.student && (
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                                                        👤 {project.student.name}
                                                    </p>
                                                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                                                        📧 {project.student.email}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-muted" style={{ marginBottom: '1.5rem', flex: 1 }}>
                                        {project.description}
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        <span className={`badge ${getStatusColor(mapStatus(project.status))}`}>
                                            {mapStatus(project.status)}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span className="text-sm text-muted">Prazo: {project.deadline}</span>
                                            <ArrowRight size={18} color="var(--color-primary)" />
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span className="text-sm text-muted">Progresso</span>
                                            <span className="text-sm text-muted">{project.progress || 0}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${project.progress || 0}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, var(--color-primary), #ec4899)',
                                                borderRadius: '3px',
                                                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}></div>
                                        </div>
                                    </div>
                                </Link>

                                {/* Botões de ação - só mostrar para alunos (donos do projeto) ou professores */}
                                {(user?.role === 'STUDENT' && project.studentId === user.id) || user?.role === 'TEACHER' ? (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}>
                                        <button
                                            onClick={(e) => handleEdit(project, e)}
                                            className="btn btn-outline"
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: '50%',
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Editar projeto"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(project.id, e)}
                                            className="btn"
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: '50%',
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'var(--color-danger)',
                                                borderColor: 'var(--color-danger)',
                                                color: 'white'
                                            }}
                                            title="Deletar projeto"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })
                )}
            </div>

            {!loading && filteredProjects.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <FolderKanban size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
                    <p className="text-muted">Nenhum projeto encontrado com estes critérios.</p>
                </div>
            )}
        </div>
    );
};

export default Projects;
