import { PrismaClient } from './generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar usuários de teste
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Criar aluno
    const student = await prisma.user.upsert({
        where: { email: 'aluno@teste.com' },
        update: {},
        create: {
            email: 'aluno@teste.com',
            password: hashedPassword,
            name: 'João Silva',
            role: 'STUDENT'
        }
    });

    console.log('✅ Criado usuário aluno:', student.email);

    // Criar professor
    const teacher = await prisma.user.upsert({
        where: { email: 'professor@teste.com' },
        update: {},
        create: {
            email: 'professor@teste.com',
            password: hashedPassword,
            name: 'Prof. Maria Santos',
            role: 'TEACHER'
        }
    });

    console.log('✅ Criado usuário professor:', teacher.email);

    // Criar alguns projetos de exemplo para o aluno
    const project1 = await prisma.project.create({
        data: {
            title: 'Redesign do E-commerce',
            description: 'Redesenho da página principal de produtos e fluxo de checkout para melhor conversão.',
            briefing: 'Foco na responsividade móvel e checkout simplificado.',
            status: 'REVIEW',
            progress: 75,
            deadline: '15/12/2024',
            studentId: student.id,
            teacherId: teacher.id
        }
    });

    console.log('✅ Criado projeto:', project1.title);

    // Adicionar entregas ao projeto
    await prisma.delivery.create({
        data: {
            name: 'Wireframes_v1.pdf',
            comments: 'Bom começo, mas precisa de mais espaço em branco.',
            projectId: project1.id,
            userId: student.id
        }
    });

    await prisma.delivery.create({
        data: {
            name: 'AltaFidelidade_v1.fig',
            comments: 'Cores ótimas. Ajustar o tamanho da fonte no mobile.',
            projectId: project1.id,
            userId: student.id
        }
    });

    // Adicionar feedback do professor
    await prisma.feedback.create({
        data: {
            content: 'Por favor, revise as taxas de contraste. O design está bom, mas precisa de ajustes de acessibilidade.',
            projectId: project1.id,
            authorId: teacher.id
        }
    });

    console.log('✅ Adicionadas entregas e feedbacks');

    // Criar mais projetos
    await prisma.project.create({
        data: {
            title: 'App de Banco Mobile',
            description: 'Criando uma nova experiência bancária móvel para a Geração Z.',
            briefing: 'Modo escuro primeiro, recursos de poupança gamificados.',
            status: 'PROTOTYPE',
            progress: 40,
            deadline: '10/01/2025',
            studentId: student.id,
            teacherId: teacher.id
        }
    });

    await prisma.project.create({
        data: {
            title: 'Site Corporativo',
            description: 'Site corporativo moderno para um escritório de advocacia.',
            briefing: 'Profissional, confiável, esquema de cores azul e cinza.',
            status: 'BRIEFING',
            progress: 10,
            deadline: '01/02/2025',
            studentId: student.id
        }
    });

    await prisma.project.create({
        data: {
            title: 'Campanha de Redes Sociais',
            description: 'Ativos para a campanha de fim de ano.',
            briefing: 'Festivo, brilhante, engajador.',
            status: 'FINALIZATION',
            progress: 90,
            deadline: '05/12/2024',
            studentId: student.id,
            teacherId: teacher.id
        }
    });

    console.log('✅ Criados projetos adicionais');
    console.log('');
    console.log('🎉 Seed concluído com sucesso!');
    console.log('');
    console.log('📝 Credenciais de teste:');
    console.log('   Aluno: aluno@teste.com / 123456');
    console.log('   Professor: professor@teste.com / 123456');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
