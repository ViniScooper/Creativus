//  Função para atualizar progresso do projeto automaticamente
const updateProjectProgress = async (projectId, token) => {
    try {
        // Buscar projeto atualizado
        const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return;

        const projectData = await response.json();

        // Calcular progresso baseado nas entregas
        const briefingDocs = projectData.deliveries?.filter(d => d.name?.startsWith('Briefing -')) || [];
        const prototypeDocs = projectData.deliveries?.filter(d =>
            !d.name?.startsWith('Briefing -') &&
            !d.name?.startsWith('Resposta ao feedback:') &&
            !d.name?.startsWith('Comentário geral:')
        ) || [];
        const feedbackCount = projectData.feedbacks?.length || 0;

        // Lógica de progresso:
        // 25% - Tem briefing
        // 50% - Tem protótipo
        // 75% - Tem feedback do professor
        // 100% - Status FINALIZATION

        let newProgress = 0;
        let newStatus = projectData.status;

        // Se já está finalizado, progresso é 100%
        if (projectData.status === 'FINALIZATION') {
            newProgress = 100;
        } else {
            if (briefingDocs.length > 0) {
                newProgress = 25;
                if (newStatus === 'BRIEFING') {
                    newStatus = 'PROTOTYPE';
                }
            }

            if (prototypeDocs.length > 0) {
                newProgress = 50;
                if (newStatus === 'PROTOTYPE') {
                    newStatus = 'REVIEW';
                }
            }

            if (feedbackCount > 0) {
                newProgress = 75;
            }
        }

        // Atualizar apenas se houver mudança
        if (newProgress !== projectData.progress || newStatus !== projectData.status) {
            await fetch(`http://localhost:3000/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    progress: newProgress,
                    status: newStatus
                })
            });

            return true; // Indica que houve atualização
        }

        return false;
    } catch (error) {
        console.error('Erro ao atualizar progresso:', error);
        return false;
    }
};

export default updateProjectProgress;
