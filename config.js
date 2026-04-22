/**
 * config.js - Configuração centralizada do projeto "Onde Tem?"
 */

const ESTABELECIMENTOS = [
    {
        id: 0,
        nome: "Studio Bella Donna",
        descricao: "Cabelo • Unhas • Sobrancelhas",
        imagem: "https://frizzar.com.br/blog/wp-content/uploads/2025/01/salao-de-beleza-moderno.webp",
        avaliacao: 4.8,
        distancia: "220 m",
        endereco: "Rua das Palmeiras, 120 - Centro, Saquarema/RJ",
        telefone: "(22) 99999-0001",
        lat: -22.9345,
        lng: -42.4951,
        categorias: ["Cabelo", "Unhas", "Sobrancelhas"],
        precoBase: 35,
        servicos: [
            { nome: "Corte Feminino", preco: 120.00 },
            { nome: "Manicure Simples", preco: 35.00 }
        ]
    },
    {
        id: 1,
        nome: "Clínica Estética Flores",
        descricao: "Rosto • Depilação • Massagem",
        imagem: "https://s2.glbimg.com/Ha2q-YYa3pCWtwM4E51zi_p-POI=/940x523/e.glbimg.com/og/ed/f/original/2019/02/20/blow-dry-bar-del-mar-chairs-counter-853427.jpg",
        avaliacao: 4.9,
        distancia: "1.1 km",
        endereco: "Av. Oceânica, 500 - Itaúna, Saquarema/RJ",
        telefone: "(22) 99999-0002",
        lat: -22.9350,
        lng: -42.4945,
        categorias: ["Rosto", "Depilação", "Massagem"],
        precoBase: 150,
        servicos: [
            { nome: "Limpeza de Pele", preco: 150.00 },
            { nome: "Drenagem Linfática", preco: 180.00 }
        ]
    },
    {
        id: 2,
        nome: "Espaço Glow",
        descricao: "Unhas • Sobrancelhas • Rosto",
        imagem: "https://ferrante.com.br/wp-content/uploads/2024/11/decoracao-minimalista-salao.jpg.jpeg",
        avaliacao: 4.7,
        distancia: "500 m",
        endereco: "Rua do Sol, 45 - Bacaxá, Saquarema/RJ",
        telefone: "(22) 99999-0003",
        lat: -22.9340,
        lng: -42.4955,
        categorias: ["Unhas", "Sobrancelhas", "Rosto"],
        precoBase: 60,
        servicos: [
            { nome: "Design de Sobrancelhas", preco: 60.00 },
            { nome: "Alongamento em Gel", preco: 160.00 }
        ]
    },
    {
        id: 3,
        nome: "Barbearia Vintage Co.",
        descricao: "Cabelo • Barba",
        imagem: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80",
        avaliacao: 4.8,
        distancia: "350 m",
        endereco: "Rua dos Navegantes, 88 - Centro, Saquarema/RJ",
        telefone: "(22) 99999-0004",
        lat: -22.9360,
        lng: -42.4962,
        categorias: ["Cabelo"],
        precoBase: 45,
        servicos: [
            { nome: "Corte Masculino", preco: 45.00 },
            { nome: "Barba Completa", preco: 40.00 }
        ]
    },
    {
        id: 4,
        nome: "Nail Atelier Praia",
        descricao: "Unhas • Sobrancelhas",
        imagem: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80",
        avaliacao: 4.9,
        distancia: "750 m",
        endereco: "Rua Beira-Mar, 210 - Itaúna, Saquarema/RJ",
        telefone: "(22) 99999-0005",
        lat: -22.9328,
        lng: -42.4935,
        categorias: ["Unhas", "Sobrancelhas"],
        precoBase: 55,
        servicos: [
            { nome: "Spa dos Pés", preco: 90.00 },
            { nome: "Nail Art Autoral", preco: 70.00 }
        ]
    },
    {
        id: 5,
        nome: "Zen Spa & Massagens",
        descricao: "Massagem • Rosto",
        imagem: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",
        avaliacao: 4.9,
        distancia: "1.4 km",
        endereco: "Alameda das Acácias, 12 - Porto da Roça, Saquarema/RJ",
        telefone: "(22) 99999-0006",
        lat: -22.9378,
        lng: -42.4928,
        categorias: ["Massagem", "Rosto"],
        precoBase: 120,
        servicos: [
            { nome: "Massagem Relaxante 60min", preco: 120.00 },
            { nome: "Ritual Facial Hidratante", preco: 180.00 }
        ]
    },
    {
        id: 6,
        nome: "Dermo Clínica Lumière",
        descricao: "Rosto • Depilação",
        imagem: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
        avaliacao: 4.8,
        distancia: "2.0 km",
        endereco: "Av. Saquarema, 1500 - Bacaxá, Saquarema/RJ",
        telefone: "(22) 99999-0007",
        lat: -22.9310,
        lng: -42.4990,
        categorias: ["Rosto", "Depilação"],
        precoBase: 180,
        servicos: [
            { nome: "Peeling de Diamante", preco: 220.00 },
            { nome: "Depilação a Laser (pernas)", preco: 350.00 }
        ]
    },
    {
        id: 7,
        nome: "Cílios & Brow Lab",
        descricao: "Sobrancelhas • Cílios • Rosto",
        imagem: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=80",
        avaliacao: 4.7,
        distancia: "900 m",
        endereco: "Rua das Acácias, 77 - Itaúna, Saquarema/RJ",
        telefone: "(22) 99999-0008",
        lat: -22.9355,
        lng: -42.4915,
        categorias: ["Sobrancelhas", "Rosto"],
        precoBase: 80,
        servicos: [
            { nome: "Brow Lamination", preco: 120.00 },
            { nome: "Extensão de Cílios Volume Russo", preco: 220.00 }
        ]
    },
    {
        id: 8,
        nome: "Salão Modernitá",
        descricao: "Cabelo • Unhas",
        imagem: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80",
        avaliacao: 4.6,
        distancia: "1.7 km",
        endereco: "Rua Oceânica, 330 - Porto da Roça, Saquarema/RJ",
        telefone: "(22) 99999-0009",
        lat: -22.9300,
        lng: -42.4970,
        categorias: ["Cabelo", "Unhas"],
        precoBase: 90,
        servicos: [
            { nome: "Coloração + Corte", preco: 260.00 },
            { nome: "Escova Progressiva", preco: 320.00 }
        ]
    },
    {
        id: 9,
        nome: "Espaço Holístico Vital",
        descricao: "Massagem • Rosto • Depilação",
        imagem: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80",
        avaliacao: 5.0,
        distancia: "2.3 km",
        endereco: "Estrada do Sol, 2100 - Sampaio Correia, Saquarema/RJ",
        telefone: "(22) 99999-0010",
        lat: -22.9295,
        lng: -42.4900,
        categorias: ["Massagem", "Rosto", "Depilação"],
        precoBase: 140,
        servicos: [
            { nome: "Shiatsu Terapêutico", preco: 140.00 },
            { nome: "Reflexologia Podal", preco: 110.00 }
        ]
    }
];

const HORARIOS_DISPONIVEIS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

const STORAGE_KEYS = {
    agendamentos: "ondetem_agendamentos"
};

const METODOS_PAGAMENTO = [
    { valor: 'pix', label: 'Pix' },
    { valor: 'cartao', label: 'Cartão de Crédito' },
    { valor: 'local', label: 'Pagar no Estabelecimento' }
];

const MAPA_CONFIG = {
    coordenada_padrao: [-22.9345, -42.4951],
    zoom: 13
};
