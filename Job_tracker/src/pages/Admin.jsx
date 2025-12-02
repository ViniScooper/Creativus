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
    const [projectsForApproval, setProjectsForApproval] = useState([]);
    const [evaluatingProject, setEvaluatingProject] = useState(null);
    const [gradeInput, setGradeInput] = useState(0);
    const [checklistInput, setChecklistInput] = useState([]);

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

    // Fetch projetos em REVIEW (prontos p/ aprovação)
    const fetchProjectsForApproval = async () => {
        try {
            const res = await fetch('http://localhost:3000/admin/review-projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProjectsForApproval(data);
            }
        } catch (err) {
            console.error('Erro ao buscar projetos em revisão:', err);
        }
    };

    useEffect(() => {
        if (user?.role === 'TEACHER') {
            fetchProjectsForApproval();
        }
    }, [user, token]);

    const openEvaluate = (project) => {
        setEvaluatingProject(project);
        setGradeInput(project.grade || 0);
        setChecklistInput(
            project.checklist?.map(item => ({ ...item })) || [{ title: '', isDone: false }]
        );
    };

    const handleChecklistChange = (idx, field, value) => {
        setChecklistInput(
            checklistInput.map((item, i) => i === idx ? { ...item, [field]: value } : item)
        );
    };

    const handleAddChecklist = () => {
        setChecklistInput([...checklistInput, { title: '', isDone: false }]);
    };

    const submitEvaluate = async (id) => {
        try {
            const res = await fetch(`http://localhost:3000/projects/${id}/evaluate`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ grade: gradeInput, checklist: checklistInput })
            });
            if (res.ok) {
                fetchProjectsForApproval();
                setEvaluatingProject(null);
            }
        } catch (err) {
            console.error('Erro ao aprovar projeto:', err);
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

            {/* Painel: Projetos Prontos para Aprovação */}
            {user.role === 'TEACHER' && (
                <div className="card" style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Projetos Prontos para Aprovação</h3>
                    {projectsForApproval.length > 0 ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {projectsForApproval.map((project) => (
                                <div key={project.id} className="card" style={{ border: '1px solid #ddd', borderRadius: 10, padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4>{project.title}</h4>
                                            <p className="text-sm text-muted">Aluno: {project.student.name}</p>
                                            <p className="text-sm text-muted">Prazo: {project.deadline}</p>
                                            <p className="text-sm text-muted">Nota atual: {project.grade ?? '-'}</p>
                                        </div>
                                        <button className="btn btn-outline" onClick={() => openEvaluate(project)} style={{marginLeft:8}}>
                                            Aprovar e Finalizar
                                        </button>
                                    </div>
                                    {/* Exibir checklist atual */}
                                    {project.checklist && project.checklist.length > 0 && (
                                        <ul style={{marginTop:8}}>
                                            {project.checklist.map(item => (
                                                <li key={item.id}>{item.title} {item.isDone ? '✅' : '❌'}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#888' }}>Nenhum projeto pronto para aprovação.</div>
                    )}
                    {/* Modal de avaliação */}
                    {evaluatingProject && (
                        <div className="modal" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,.45)', display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <div className="card" style={{minWidth:320}}>
                                <h4>Aprovar Projeto</h4>
                                <p>Aluno: {evaluatingProject.student.name}</p>
                                <label htmlFor="nota">Nota (0-10):</label>
                                <input value={gradeInput} onChange={e=>setGradeInput(Number(e.target.value))} type="number" step="0.1" min="0" max="10" style={{width:'100%',marginBottom:12}}/>
                                <label>Checklist:</label>
                                {checklistInput.map((item, idx) => (
                                    <div key={idx} style={{display:'flex', gap:4,marginBottom:4}}>
                                        <input value={item.title} onChange={e=>handleChecklistChange(idx,'title',e.target.value)} placeholder="Título"/>
                                        <input type="checkbox" checked={item.isDone} onChange={e=>handleChecklistChange(idx,'isDone',e.target.checked)} />
                                    </div>
                                ))}
                                <button type="button" className="btn btn-secondary" onClick={handleAddChecklist}>Adicionar Item</button>
                                <div style={{marginTop:16,display:'flex',gap:8}}>
                                    <button className="btn btn-primary" onClick={()=>submitEvaluate(evaluatingProject.id)}>Salvar e Finalizar</button>
                                    <button className="btn btn-outline" onClick={()=>setEvaluatingProject(null)}>Cancelar</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

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
