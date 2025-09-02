# CREART PDV - Sistema de Ponto de Venda

Sistema completo de ponto de venda desenvolvido em React/TypeScript, baseado no projeto original CREART-SOFTMANAGER em Python/PySide6.

## Funcionalidades

### ✅ Sistema de Login
- Autenticação de usuários
- Controle de sessão
- Diferentes níveis de acesso (admin/operador)

### ✅ Gestão de Produtos
- Cadastro, edição e exclusão de produtos
- Controle de estoque
- Categorização de produtos
- Código de barras
- Alertas de estoque baixo

### ✅ Ponto de Venda (PDV)
- Interface intuitiva para vendas
- Carrinho de compras interativo
- Busca de produtos por nome ou código de barras
- Filtros por categoria
- Múltiplas formas de pagamento (Dinheiro, Cartão, PIX)
- Desconto por venda
- Geração de recibos em TXT e PDF

### ✅ Gestão de Vendas
- Histórico completo de vendas
- Detalhes de cada venda
- Status de vendas (concluída, cancelada, pendente)
- Busca e filtros avançados

### ✅ Gestão de Clientes
- Cadastro de clientes
- Informações de contato
- Histórico de relacionamento

### ✅ Controle de Caixa
- Abertura e fechamento de caixa
- Controle de valores inicial e final
- Depósitos e retiradas
- Histórico de movimentações
- Relatório de vendas em dinheiro

### ✅ Relatórios
- Relatórios de vendas por período
- Produtos mais vendidos
- Análise de formas de pagamento
- Ticket médio
- Exportação de relatórios

## Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de CSS
- **shadcn/ui** - Componentes de interface
- **React Router** - Roteamento
- **Context API** - Gerenciamento de estado
- **LocalStorage** - Persistência de dados
- **jsPDF** - Geração de PDFs
- **Lucide React** - Ícones

## Instalação e Execução

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>

# Navegue até o diretório
cd <YOUR_PROJECT_NAME>

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Credenciais de Teste

Para acessar o sistema, use:
- **Usuário:** admin
- **Senha:** admin123

## Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── ui/            # Componentes base (shadcn/ui)
│   ├── Layout.tsx     # Layout principal da aplicação
│   └── LoginForm.tsx  # Formulário de login
├── contexts/          # Contextos React
│   ├── AuthContext.tsx    # Autenticação
│   └── CartContext.tsx    # Carrinho de compras
├── hooks/             # Custom hooks
│   ├── useProducts.ts     # Gestão de produtos
│   ├── useSales.ts        # Gestão de vendas
│   └── use-toast.ts       # Sistema de notificações
├── pages/             # Páginas da aplicação
│   ├── Dashboard.tsx      # Página inicial
│   ├── Products.tsx       # Gestão de produtos
│   ├── POS.tsx           # Ponto de venda
│   ├── Sales.tsx         # Histórico de vendas
│   ├── Customers.tsx     # Gestão de clientes
│   ├── CashRegister.tsx  # Controle de caixa
│   └── Reports.tsx       # Relatórios
├── types/             # Definições de tipos TypeScript
└── lib/               # Utilitários
```

## Funcionalidades Avançadas

### Carrinho de Compras
- Adição/remoção de produtos
- Controle de quantidade
- Cálculo automático de subtotais e total
- Validação de estoque

### Geração de Recibos
- Recibos em formato TXT para impressoras térmicas
- Recibos em PDF para e-mail ou impressão
- Layout profissional com informações completas

### Controle de Estoque
- Atualização automática após vendas
- Alertas visuais para produtos em falta
- Relatórios de produtos com estoque baixo

### Sistema de Relatórios
- Análise de vendas por período customizável
- Ranking de produtos mais vendidos
- Distribuição por formas de pagamento
- Métricas de performance (ticket médio, etc.)

## Inspirado no CREART-SOFTMANAGER

Este projeto é uma evolução do sistema original desenvolvido em Python/PySide6, trazendo as mesmas funcionalidades para uma interface web moderna e responsiva, mantendo a essência do sistema original mas com melhorias na experiência do usuário e acessibilidade.

## Licença

LGPL-2.1 license

## Suporte

Para dúvidas ou suporte, entre em contato através dos canais oficiais do projeto.