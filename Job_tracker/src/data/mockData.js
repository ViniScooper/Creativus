export const projects = [
    {
        id: 1,
        title: "Redesign do E-commerce",
        status: "Revisão",
        deadline: "15/12/2024",
        description: "Redesenho da página principal de produtos e fluxo de checkout para melhor conversão.",
        progress: 75,
        briefing: "Foco na responsividade móvel e checkout simplificado.",
        deliveries: [
            { id: 101, name: "Wireframes_v1.pdf", date: "20/11/2024", comments: "Bom começo, mas precisa de mais espaço em branco." },
            { id: 102, name: "AltaFidelidade_v1.fig", date: "28/11/2024", comments: "Cores ótimas. Ajustar o tamanho da fonte no mobile." }
        ],
        feedback: [
            { id: 201, author: "Prof. Silva", date: "21/11/2024", content: "Por favor, revise as taxas de contraste." }
        ]
    },
    {
        id: 2,
        title: "App de Banco Mobile",
        status: "Protótipo",
        deadline: "10/01/2025",
        description: "Criando uma nova experiência bancária móvel para a Geração Z.",
        progress: 40,
        briefing: "Modo escuro primeiro, recursos de poupança gamificados.",
        deliveries: [],
        feedback: []
    },
    {
        id: 3,
        title: "Site Corporativo",
        status: "Briefing",
        deadline: "01/02/2025",
        description: "Site corporativo moderno para um escritório de advocacia.",
        progress: 10,
        briefing: "Profissional, confiável, esquema de cores azul e cinza.",
        deliveries: [],
        feedback: []
    },
    {
        id: 4,
        title: "Campanha de Redes Sociais",
        status: "Finalização",
        deadline: "05/12/2024",
        description: "Ativos para a campanha de fim de ano.",
        progress: 90,
        briefing: "Festivo, brilhante, engajador.",
        deliveries: [
            { id: 103, name: "Todos_Ativos.zip", date: "01/12/2024", comments: "Pronto para aprovação final." }
        ],
        feedback: []
    }
];

export const currentUser = {
    name: "Vinicius",
    role: "aluno" // ou 'professor'
};
