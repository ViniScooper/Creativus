import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { File, Download, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Deliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDeliveries();
    }, [token]);

    const fetchDeliveries = async () => {
        try {
            const response = await fetch('http://26.116.233.104:3000/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const projects = await response.json();

                // Extrair todas as entregas dos projetos do usuário
                const allDeliveries = projects.flatMap(p =>
                    p.deliveries.map(d => ({
                        ...d,
                        projectTitle: p.title,
                        projectId: p.id
                    }))
                ).filter(d => !d.name?.startsWith('Resposta ao feedback:'));

                setDeliveries(allDeliveries);
            }
        } catch (error) {
            console.error('Erro ao buscar entregas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewDelivery = () => {
        // Redirecionar para a página de projetos
        navigate('/projects');
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p className="text-muted">Carregando entregas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h1>Minhas Entregas</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleNewDelivery}
                >
                    Nova Entrega
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Arquivo</th>
                            <th style={{ padding: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Projeto</th>
                            <th style={{ padding: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Data</th>
                            <th style={{ padding: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Comentários</th>
                            <th style={{ padding: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveries.map((delivery) => (
                            <tr key={delivery.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg)', borderRadius: '0.5rem' }}>
                                        <File size={20} className="text-muted" />
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{delivery.name}</span>
                                </td>
                                <td style={{ padding: '1.5rem' }}>{delivery.projectTitle}</td>
                                <td style={{ padding: '1.5rem' }} className="text-muted">{delivery.date}</td>
                                <td style={{ padding: '1.5rem' }} className="text-muted">{delivery.comments}</td>
                                <td style={{ padding: '1.5rem' }}>
                                    <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '0.5rem' }}>
                                        <Download size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {deliveries.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    Nenhuma entrega encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Deliveries;