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
                }
            }
        });

        if (!project) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        // Verificar permissão
        if (req.user.role === 'STUDENT' && project.studentId !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para acessar este projeto' });
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
            include: { project: true }
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

        return res.status(201).json(reply);
    } catch (error) {
        console.error('Erro ao responder feedback:', error);
        return res.status(500).json({ error: 'Erro ao responder feedback' });
    }
});

// ==================== SERVIDOR ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});