import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-secreto-aqui-mude-em-producao';

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Registro de novo usuário
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // Verificar se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'STUDENT'
            }
        });

        // Gerar token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        return res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
});

// Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Gerar token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

// Obter dados do usuário autenticado
app.get('/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
});

// ==================== ROTAS DE PROJETOS ====================

// Listar projetos (filtrado por perfil)
app.get('/projects', authenticateToken, async (req, res) => {
    try {
        let projects;

        if (req.user.role === 'TEACHER') {
            // Professor vê todos os projetos
            projects = await prisma.project.findMany({
                include: {
                    student: {
                        select: { id: true, name: true, email: true }
                    },
                    deliveries: true,
                    feedbacks: {
                        include: {
                            author: {
                                select: { name: true }
                            },
                            replies: {
                                include: {
                                    author: {
                                        select: { name: true, role: true }
                                    }
                                },
                                orderBy: { createdAt: 'asc' }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Aluno vê apenas seus projetos
            projects = await prisma.project.findMany({
                where: { studentId: req.user.id },
                include: {
                    deliveries: true,
                    feedbacks: {
                        include: {
                            author: {
                                select: { name: true }
                            },
                            replies: {
                                include: {
                                    author: {
                                        select: { name: true, role: true }
                                    }
                                },
                                orderBy: { createdAt: 'asc' }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        // Garantir que todos os projetos finalizados tenham progresso 100%
        for (let i = 0; i < projects.length; i++) {
            if (projects[i].status === 'FINALIZATION' && projects[i].progress !== 100) {
                await prisma.project.update({
                    where: { id: projects[i].id },
                    data: { progress: 100 }
                });
                projects[i].progress = 100;
            }
        }

        return res.status(200).json(projects);
    } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        return res.status(500).json({ error: 'Erro ao buscar projetos' });
    }
});

// Buscar projeto específico
app.get('/projects/:id', authenticateToken, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: {
                student: {
                    select: { id: true, name: true, email: true }
                },
                deliveries: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                feedbacks: {
                    include: {
                        author: {
                            select: { name: true, role: true }
                        },
                        replies: {
                            include: {
                                author: {
                                    select: { name: true, role: true }
                                }
                            },
                            orderBy: { createdAt: 'asc' }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                checklist: true
            }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        // Verificar permissão
        if (req.user.role === 'STUDENT' && project.studentId !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para acessar este projeto' });
        }

        // Garantir que projetos finalizados sempre tenham progresso 100%
        if (project.status === 'FINALIZATION' && project.progress !== 100) {
            project = await prisma.project.update({
                where: { id: req.params.id },
                data: { progress: 100 }
            });
            // Recarregar com includes
            project = await prisma.project.findUnique({
                where: { id: req.params.id },
                include: {
                    student: {
                        select: { id: true, name: true, email: true }
                    },
                    deliveries: {
                        include: {
                            user: {
                                select: { name: true }
                            }
                        }
                    },
                    feedbacks: {
                        include: {
                            author: {
                                select: { name: true, role: true }
                            },
                            replies: {
                                include: {
                                    author: {
                                        select: { name: true, role: true }
                                    }
                                },
                                orderBy: { createdAt: 'asc' }
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    },
                    checklist: true
                }
            });
        }

        return res.status(200).json(project);
    } catch (error) {
        console.error('Erro ao buscar projeto:', error);
        return res.status(500).json({ error: 'Erro ao buscar projeto' });
    }
});

// Criar projeto (apenas aluno)
app.post('/projects', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'STUDENT') {
            return res.status(403).json({ error: 'Apenas alunos podem criar projetos' });
        }

        const { title, description, briefing, deadline } = req.body;

        const project = await prisma.project.create({
            data: {
                title,
                description,
                briefing,
                deadline,
                studentId: req.user.id
            }
        });

        return res.status(201).json(project);
    } catch (error) {
        console.error('Erro ao criar projeto:', error);
        return res.status(500).json({ error: 'Erro ao criar projeto' });
    }
});

// Atualizar projeto
app.put('/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { status, progress } = req.body;

        // Validar campos permitidos
        const allowedFields = ['status', 'progress'];
        const receivedFields = Object.keys(req.body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({ error: `Campos não permitidos: ${invalidFields.join(', ')}` });
        }

        const project = await prisma.project.findUnique({
            where: { id: req.params.id }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        // Verificar permissão
        if (req.user.role === 'STUDENT' && project.studentId !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão' });
        }

        // Apenas professor ou dono podem concluir projeto
        if (status === 'FINALIZATION' && req.user.role === 'STUDENT') {
            return res.status(403).json({ error: 'Apenas professores podem concluir projetos' });
        }

        // Trava updates em projetos FINALIZATION em endpoints gerais de edição
        if (project.status === 'FINALIZATION') {
            return res.status(400).json({ error: 'Projeto já está finalizado e não pode mais ser alterado.' });
        }

        const updatedProject = await prisma.project.update({
            where: { id: req.params.id },
            data: {
                status,
                progress
            }
        });

        return res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Erro ao atualizar projeto:', error);
        return res.status(500).json({ error: 'Erro ao atualizar projeto' });
    }
});

// 1. Endpoint para aluno solicitar aprovação (status: REVIEW)
app.put('/projects/:id/request-approval', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'STUDENT') {
            return res.status(403).json({ error: 'Apenas alunos podem solicitar aprovação.' });
        }
        const project = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!project || project.studentId !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para este projeto.' });
        }
        if (project.status === 'FINALIZATION') {
            return res.status(400).json({ error: 'Projeto já está finalizado.' });
        }
        // Buscar dados do aluno
        const student = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        // Muda status para REVIEW sempre (pode solicitar quantas vezes necessário)
        const updated = await prisma.project.update({
            where: { id: req.params.id },
            data: { status: 'REVIEW' }
        });

        // Notificar professores sobre solicitação de aprovação
        const teachers = await prisma.user.findMany({
            where: { role: 'TEACHER' }
        });
        for (const teacher of teachers) {
            await createNotification(
                teacher.id,
                'PROJECT_REVIEW_REQUESTED',
                'Nova Solicitação de Aprovação',
                `${student.name} solicitou aprovação para o projeto "${project.title}"`,
                project.id
            );
        }

        res.json(updated);
    } catch (err) {
        console.error('Erro ao solicitar aprovação:', err);
        res.status(500).json({ error: 'Erro ao solicitar aprovação.' });
    }
});

// 2. Novo endpoint para painel admin: projetos em REVIEW
app.get('/admin/review-projects', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'TEACHER') {
            return res.status(403).json({ error: 'Apenas professores podem visualizar esta tela' });
        }
        const projects = await prisma.project.findMany({
            where: { status: 'REVIEW' },
            include: {
                student: { select: { id: true, name: true, email: true } },
                deliveries: true,
                feedbacks: true,
                checklist: true
            },
            orderBy: { deadline: 'asc' }
        });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar projetos em revisão.' });
    }
});

// 3. Avaliação + aprovação final pelo professor (muda status para FINALIZATION)
app.put('/projects/:id/evaluate', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'TEACHER') {
            return res.status(403).json({ error: 'Apenas professores podem avaliar projetos.' });
        }
        const { grade, checklist } = req.body;
        const project = await prisma.project.findUnique({ 
            where: { id: req.params.id },
            include: { student: true }
        });
        if (!project) return res.status(404).json({ error: 'Projeto não encontrado.' });
        // Bloqueia caso já finalizado
        if (project.status === 'FINALIZATION') {
            return res.status(400).json({ error: 'Projeto já está finalizado.' });
        }
        // Só pode aprovar se estiver em REVIEW
        if (project.status !== 'REVIEW') {
            return res.status(400).json({ error: 'Projeto precisa estar em análise (REVIEW) para aprovação.' });
        }
        // Atualizar nota, checklist, status e progresso para 100%
        const updatedProject = await prisma.project.update({
            where: { id: req.params.id },
            data: { 
                grade: grade, 
                status: 'FINALIZATION',
                progress: 100
            }
        });
        // Atualizar/Adicionar itens de checklist
        if (Array.isArray(checklist)) {
            for (const item of checklist) {
                if (item.id) {
                    await prisma.checklist.update({ where: { id: item.id }, data: { title: item.title, isDone: item.isDone } });
                } else {
                    await prisma.checklist.create({ data: { projectId: req.params.id, title: item.title, isDone: !!item.isDone } });
                }
            }
        }

        // Notificar aluno sobre aprovação e nota
        if (project.student) {
            await createNotification(
                project.student.id,
                'PROJECT_APPROVED',
                'Projeto Aprovado!',
                `Seu projeto "${project.title}" foi aprovado! Nota: ${grade}/10`,
                project.id
            );
        }

        return res.json({ message: 'Projeto avaliado e aprovado!', project: updatedProject });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao avaliar projeto.' });
    }
});

// Endpoint para professor ver todos projetos entregues no prazo
app.get('/admin/project-on-time', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'TEACHER') {
            return res.status(403).json({ error: 'Apenas professores podem visualizar esta tela' });
        }
        // Considerar prazo simples (deadline > now ou FINALIZATION antes do deadline)
        const now = new Date();
        const projects = await prisma.project.findMany({
            where: {
                deadline: { gte: now.toISOString().split('T')[0] }, // deadline ainda não passou
                status: 'FINALIZATION'    // projeto finalizado
            },
            include: {
                student: { select: { id: true, name: true, email: true } },
                deliveries: true,
                feedbacks: true,
                checklist: true
            },
            orderBy: { deadline: 'asc' }
        });
        res.json(projects);
    } catch (err) {
        console.error('Erro ao buscar projetos entregues no prazo:', err);
        res.status(500).json({ error: 'Erro ao buscar projetos no prazo.' });
    }
});

// Deletar projeto
app.delete('/projects/:id', authenticateToken, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: {
                deliveries: true,
                feedbacks: true
            }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        // Verificar permissão (apenas o dono pode deletar)
        if (req.user.role === 'STUDENT' && project.studentId !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para deletar este projeto' });
        }

        // Deletar dependências primeiro (entregas e feedbacks)
        await prisma.delivery.deleteMany({
            where: { projectId: req.params.id }
        });

        await prisma.feedback.deleteMany({
            where: { projectId: req.params.id }
        });

        // Agora deletar o projeto
        await prisma.project.delete({
            where: { id: req.params.id }
        });

        return res.status(200).json({ message: 'Projeto deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar projeto:', error);
        return res.status(500).json({ error: 'Erro ao deletar projeto' });
    }
});

// ==================== ROTAS DE ENTREGAS ====================

// Criar entrega
app.post('/deliveries', authenticateToken, async (req, res) => {
    try {
        const { projectId, name, comments, fileUrl } = req.body;

        const delivery = await prisma.delivery.create({
            data: {
                name,
                comments,
                fileUrl,
                projectId,
                userId: req.user.id
            }
        });

        return res.status(201).json(delivery);
    } catch (error) {
        console.error('Erro ao criar entrega:', error);
        return res.status(500).json({ error: 'Erro ao criar entrega' });
    }
});

// ==================== ROTAS DE FEEDBACK ====================

// Adicionar feedback (apenas professor)
app.post('/feedback', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'TEACHER') {
            return res.status(403).json({ error: 'Apenas professores podem dar feedback' });
        }

        const { projectId, content } = req.body;

        // Buscar projeto para notificar o aluno
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { student: true }
        });

        const feedback = await prisma.feedback.create({
            data: {
                content,
                projectId,
                authorId: req.user.id
            },
            include: {
                author: {
                    select: { name: true, role: true }
                }
            }
        });

        // Notificar aluno sobre novo feedback
        if (project && project.student) {
            await createNotification(
                project.student.id,
                'FEEDBACK_RECEIVED',
                'Novo Feedback Recebido',
                `Você recebeu um novo feedback no projeto "${project.title}"`,
                project.id,
                feedback.id
            );
        }

        return res.status(201).json(feedback);
    } catch (error) {
        console.error('Erro ao criar feedback:', error);
        return res.status(500).json({ error: 'Erro ao criar feedback' });
    }
});

// Responder feedback (aluno ou professor)
app.post('/feedback/:id/reply', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        const feedbackId = req.params.id;

        // Verificar se o feedback existe
        const feedback = await prisma.feedback.findUnique({
            where: { id: feedbackId },
            include: { 
                project: true,
                author: true
            }
        });

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback não encontrado' });
        }

        // Verificar permissão:
        // - Professor pode responder qualquer feedback
        // - Aluno só pode responder se for dono do projeto
        if (req.user.role === 'STUDENT' && feedback.project.studentId !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para responder este feedback' });
        }

        const reply = await prisma.feedbackReply.create({
            data: {
                content,
                feedbackId,
                authorId: req.user.id
            },
            include: {
                author: {
                    select: { name: true, role: true }
                }
            }
        });

        // Buscar dados do autor da resposta
        const replyAuthor = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        // Notificar autor do feedback original sobre a resposta
        // Se aluno respondeu, notificar professor; se professor respondeu, notificar aluno
        if (req.user.role === 'STUDENT' && feedback.author.role === 'TEACHER') {
            // Aluno respondeu feedback do professor
            await createNotification(
                feedback.author.id,
                'FEEDBACK_RECEIVED',
                'Resposta ao Feedback',
                `${replyAuthor.name} respondeu seu feedback no projeto "${feedback.project.title}"`,
                feedback.project.id,
                reply.id
            );
        } else if (req.user.role === 'TEACHER' && feedback.author.role === 'STUDENT') {
            // Professor respondeu feedback do aluno (caso raro, mas possível)
            const project = await prisma.project.findUnique({
                where: { id: feedback.project.id },
                include: { student: true }
            });
            if (project && project.student) {
                await createNotification(
                    project.student.id,
                    'FEEDBACK_RECEIVED',
                    'Resposta ao Feedback',
                    `Professor respondeu seu feedback no projeto "${project.title}"`,
                    project.id,
                    reply.id
                );
            }
        }

        return res.status(201).json(reply);
    } catch (error) {
        console.error('Erro ao responder feedback:', error);
        return res.status(500).json({ error: 'Erro ao responder feedback' });
    }
});

// ==================== PERFIL ====================

// Atualizar perfil do usuário
app.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;

        // Verificar se email já está em uso por outro usuário
        if (email && email !== req.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Email já está em uso' });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: name || undefined,
                email: email || undefined
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});

// Alterar senha
app.put('/profile/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Buscar usuário com senha
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        // Verificar senha atual
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Senha atual incorreta' });
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Atualizar senha
        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });

        return res.status(200).json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        return res.status(500).json({ error: 'Erro ao alterar senha' });
    }
});

// ==================== ROTAS DE NOTIFICAÇÕES ====================

// Listar notificações do usuário
app.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50 // Últimas 50 notificações
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: req.user.id,
                isRead: false
            }
        });

        return res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        return res.status(500).json({ error: 'Erro ao buscar notificações' });
    }
});

// Marcar notificação como lida
app.put('/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        const notification = await prisma.notification.findUnique({
            where: { id: req.params.id }
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notificação não encontrada' });
        }

        if (notification.userId !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para esta notificação' });
        }

        const updated = await prisma.notification.update({
            where: { id: req.params.id },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        return res.json(updated);
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        return res.status(500).json({ error: 'Erro ao atualizar notificação' });
    }
});

// Marcar todas as notificações como lidas
app.put('/notifications/read-all', authenticateToken, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                userId: req.user.id,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        return res.json({ message: 'Todas as notificações foram marcadas como lidas' });
    } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        return res.status(500).json({ error: 'Erro ao atualizar notificações' });
    }
});

// Função auxiliar para criar notificação
const createNotification = async (userId, type, title, message, projectId = null, relatedId = null) => {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                projectId,
                relatedId
            }
        });
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
    }
};

// ==================== UTILITÁRIOS ====================

// Endpoint para corrigir progresso de projetos finalizados (temporário)
app.put('/admin/fix-progress', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'TEACHER') {
            return res.status(403).json({ error: 'Apenas professores podem executar esta ação' });
        }
        
        // Atualizar todos os projetos finalizados para progresso 100%
        const result = await prisma.project.updateMany({
            where: {
                status: 'FINALIZATION',
                progress: { lt: 100 }
            },
            data: {
                progress: 100
            }
        });
        
        return res.json({ 
            message: `${result.count} projeto(s) atualizado(s) para 100% de progresso.` 
        });
    } catch (err) {
        console.error('Erro ao corrigir progresso:', err);
        res.status(500).json({ error: 'Erro ao corrigir progresso.' });
    }
});

// ==================== SERVIDOR ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});