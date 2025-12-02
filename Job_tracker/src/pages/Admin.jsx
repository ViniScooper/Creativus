import React from 'react';
import { projects } from '../data/mockData';
import { PieChart, Users, BookOpen, BarChart3 } from 'lucide-react';

const Admin = () => {
    const stats = {
        total: projects.length,
        briefing: projects.filter(p => p.status === 'Briefing').length,
        prototype: projects.filter(p => p.status === 'Protótipo').length,
        review: projects.filter(p => p.status === 'Revisão').length,
        finalization: projects.filter(p => p.status === 'Finalização').length,
    };

    return (
        <div className="animate-fade-in">
            <h1>Painel do Administrador</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.75rem' }}>
                            <BarChart3 size={24} color="var(--color-primary)" />
                        </div>
                        <h3 style={{ margin: 0 }}>Distribuição de Projetos</h3>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-bg)', borderRadius: '0.75rem' }}>
                            <span style={{ fontWeight: 500 }}>Briefing</span>
                            <span className="badge badge-danger" style={{ fontSize: '1rem' }}>{stats.briefing}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-bg)', borderRadius: '0.75rem' }}>
                            <span style={{ fontWeight: 500 }}>Protótipo</span>
                            <span className="badge badge-info" style={{ fontSize: '1rem' }}>{stats.prototype}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-bg)', borderRadius: '0.75rem' }}>
                            <span style={{ fontWeight: 500 }}>Revisão</span>
                            <span className="badge badge-warning" style={{ fontSize: '1rem' }}>{stats.review}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-bg)', borderRadius: '0.75rem' }}>
                            <span style={{ fontWeight: 500 }}>Finalização</span>
                            <span className="badge badge-success" style={{ fontSize: '1rem' }}>{stats.finalization}</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>Ações Rápidas</h3>
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                        <button className="btn btn-primary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
                            <BookOpen size={20} /> Criar Projeto para Turma
                        </button>
                        <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
                            <Users size={20} /> Gerenciar Alunos
                        </button>
                        <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
                            <PieChart size={20} /> Gerar Relatórios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
