# 🍬 Gestão de Doces

Uma aplicação web progressiva (PWA ready) desenvolvida em React para ajudar pequenos empreendedores a gerir as suas vendas, clientes e estoque de doces de forma rápida, simples e **100% offline**.

## 🌟 Funcionalidades

* **Painel de Vendas (Resumo):** Visão geral de todos os clientes com contas ativas, saldo devedor e opção rápida de venda.
* **Gestão de Clientes:** Registo de clientes com nome, departamento e link direto para iniciar uma conversa no WhatsApp.
* **Controlo de Estoque:** Cadastro de doces com preço e quantidade. O estoque é atualizado automaticamente a cada venda ou cancelamento.
* **Caixa e Histórico:** Registo detalhado de todas as entradas de dinheiro (pagamentos parciais ou totais).
* **Funcionamento Offline:** Todos os dados são guardados nativamente no `localStorage` do navegador, não dependendo de internet para funcionar.
* **Sistema de Backup:** Possibilidade de exportar (`.json`) e importar todos os dados do sistema com um clique, garantindo segurança contra limpeza de cache.

## 🛠️ Tecnologias Utilizadas

* [React](https://reactjs.org/) (com Vite)
* [Tailwind CSS](https://tailwindcss.com/) (Estilização e Responsividade)
* [Lucide React](https://lucide.dev/) (Ícones SVG)
* Local Storage API (Persistência de Dados)
