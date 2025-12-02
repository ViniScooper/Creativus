import React, { useState } from 'react';
import { X } from 'lucide-react';

const NewProjectModal = ({ isOpen, onClose, onProjectCreated, project = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        briefing: '',
        deadline: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (project) {
            // Converter data DD/MM/YYYY para YYYY-MM-DD para o input date
            const [day, month, year] = project.deadline.split('/');
            const formattedDate = `${year}-${month}-${day}`;

            setFormData({
                title: project.title,
                description: project.description,
                briefing: project.briefing,
                deadline: formattedDate
            });
        } else {
            setFormData({
                title: '',
                description: '',
                briefing: '',
                deadline: ''
            });
        }
    }, [project, isOpen]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Formatar a data para DD/MM/YYYY
            const [year, month, day] = formData.deadline.split('-');
            const formattedDeadline = `${day}/${month}/${year}`;

            const url = project
                ? `http://localhost:3000/projects/${project.id}`
                : 'http://localhost:3000/projects';

            const method = project ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    deadline: formattedDeadline
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Erro ao ${project ? 'atualizar' : 'criar'} projeto`);
            }

            // Reset form
            if (!project) {
                setFormData({
                    title: '',
                    description: '',
                    briefing: '',
                    deadline: ''
                });
            }

            // Notify parent
            if (onProjectCreated) {
                onProjectCreated(data);
            }

            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
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
            <div className="card animate-fade-in" style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ margin: 0 }}>{project ? 'Editar Projeto' : 'Novo Projeto'}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                            e.currentTarget.style.color = 'var(--color-text)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-muted)';
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid var(--color-danger)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-danger)',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Título do Projeto *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Ex: Redesign do E-commerce"
                            required
                            style={{ marginBottom: 0 }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Descrição *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Breve descrição do que será desenvolvido..."
                            required
                            rows="3"
                            style={{ marginBottom: 0 }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Briefing *
                        </label>
                        <textarea
                            name="briefing"
                            value={formData.briefing}
                            onChange={handleChange}
                            placeholder="Requisitos, objetivos e detalhes do projeto..."
                            required
                            rows="4"
                            style={{ marginBottom: 0 }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Prazo de Entrega *
                        </label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            required
                            style={{ marginBottom: 0 }}
                        />
                    </div>

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
                            style={{ opacity: loading ? 0.6 : 1 }}
                        >
                            {loading ? (project ? 'Salvando...' : 'Criando...') : (project ? 'Salvar Alterações' : 'Criar Projeto')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProjectModal;
