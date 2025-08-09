

# PGATS-02-API

API REST para gerenciamento de usuários e transferências bancárias.

## Funcionalidades
- Registro de usuários (com opção de favorecido)
- Login e autenticação JWT
- Consulta, atualização e remoção de usuários
- Transferência de valores entre usuários
- Inserção de saldo na conta do usuário

## Tecnologias
- Node.js
- Express
- Mocha (testes)
- Swagger (documentação)

## Instalação
```bash
npm install
```

## Uso
```bash
npm start
```
Acesse a documentação Swagger em: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Endpoints Principais
### Autenticação
- POST `/users/login`  
   Body: `{ "login": "string", "senha": "string" }`
  
### Registro de Usuário
- POST `/users/register`  
   Body: `{ "login": "string", "senha": "string", "favorecido": true|false }`

### Atualizar Usuário e Inserir Saldo
- PUT `/users`  
   Body: `{ "login": "string", "senha": "string", "favorecido": true|false, "saldo": number }`

### Transferências
- POST `/transfers`  
   Body: `{ "remetente": "string", "destinatario": "string", "valor": number }`

## Autenticação JWT
Após o login, utilize o token JWT retornado para acessar rotas protegidas:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/users
```

## Testes Automatizados e Integração Contínua

Execute todos os testes automatizados localmente:
```bash
npx mocha "test/**/*.js"
```

Todos os cenários de integração e controller passaram com sucesso (21 passing).

Os testes são organizados em:
- `test/controller/`: testes unitários dos controllers
- `test/integration/`: testes de integração da API

Pipeline de integração contínua configurada via GitHub Actions (`.github/workflows/ci.yml`), que executa todos os testes automaticamente a cada push ou pull request para o branch `main`.

## Observações
- Transferência para favorecido: sem limite
- Transferência para não favorecido: até R$ 1000,00
- Saldo do remetente deve ser suficiente
- Token expira em 10 minutos

## Uso do token nas rotas protegidas
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/users
```

## Testes de autenticação

Os testes automatizados validam cenários de token válido, inválido e expirado.

## Regras de Negócio
- Login e senha obrigatórios para login e registro
- Não é permitido registrar usuários duplicados
- Transferências acima de R$ 5.000,00 só para favorecidos
- Transferências para não favorecidos só podem ser realizadas se o valor for menor que R$ 5.000,00
- Banco de dados em memória (variáveis)

## Testes Automatizados

Os testes estão em `test/api.test.js` e cobrem todos os fluxos principais.

## Autor
Renata França