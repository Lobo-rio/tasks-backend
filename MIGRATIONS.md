# Guia de Migrações TypeORM

Este documento explica como usar as migrações do TypeORM no projeto.

## 📋 Comandos Disponíveis

### Gerar Migração
Gera uma nova migração baseada nas mudanças detectadas nas entidades:
```bash
npm run migration:generate src/migrations/NomeDaMigracao
```

### Criar Migração Vazia
Cria um arquivo de migração vazio para customização manual:
```bash
npm run migration:create src/migrations/NomeDaMigracao
```

### Executar Migrações
Executa todas as migrações pendentes:
```bash
npm run migration:run
```

### Reverter Migração
Reverte a última migração executada:
```bash
npm run migration:revert
```

### Mostrar Status
Mostra todas as migrações e seus status (executadas ou pendentes):
```bash
npm run migration:show
```

## 🔄 Fluxo de Trabalho

### 1. Modificar Entidades
Faça alterações nas suas entidades TypeORM (arquivos `*.entity.ts`).

### 2. Gerar Migração
Execute o comando para gerar a migração automaticamente:
```bash
npm run migration:generate src/migrations/AdicionarCampoXYZ
```

### 3. Revisar Migração
Abra o arquivo gerado em `src/migrations/` e revise as alterações.

### 4. Executar Migração
As migrações são executadas automaticamente quando a aplicação inicia (`migrationsRun: true`).

Ou execute manualmente:
```bash
npm run migration:run
```

## ⚙️ Configuração

### Modo Desenvolvimento
- `synchronize: true` - TypeORM sincroniza automaticamente o schema
- `migrationsRun: true` - Migrações são executadas ao iniciar

### Modo Produção
- `synchronize: false` - Sincronização automática desabilitada
- `migrationsRun: true` - Apenas migrações são usadas para alterar o schema

## 📁 Estrutura

```
src/
├── data-source.ts          # Configuração do DataSource para CLI
├── migrations/             # Diretório de migrações
│   └── [timestamp]-*.ts   # Arquivos de migração
└── */domain/*.entity.ts   # Entidades TypeORM
```

## ⚠️ Boas Práticas

1. **Sempre revise** as migrações geradas antes de executá-las
2. **Teste em desenvolvimento** antes de aplicar em produção
3. **Não edite** migrações já executadas em produção
4. **Use nomes descritivos** para as migrações
5. **Faça backup** do banco antes de executar migrações em produção

## 🔍 Troubleshooting

### "No changes in database schema were found"
Isso significa que suas entidades estão sincronizadas com o banco. Não há necessidade de gerar uma migração.

### Erro ao executar migração
1. Verifique as credenciais do banco no arquivo `.env`
2. Confirme que o banco de dados está acessível
3. Revise o código da migração para erros de sintaxe

### Reverter múltiplas migrações
Execute `npm run migration:revert` múltiplas vezes, uma para cada migração que deseja reverter.
