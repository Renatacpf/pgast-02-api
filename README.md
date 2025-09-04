# Testes automatizados externos GraphQL

Os testes de mutation de transferência via GraphQL estão em `test/external/graphqlTransfer.test.js` e cobrem:
- Transferência com sucesso
- Sem saldo disponível
- Token não informado

Execute todos os testes com:
```bash
npm test
```

## Exemplo de Mutation GraphQL

### Registrar usuário
```graphql
mutation {
   registerUser(login: "userA", senha: "123", favorecido: true, saldo: 1000) {
      message
   }
}
```

### Login para obter token
```graphql
mutation {
   loginUser(login: "userA", senha: "123") {
      token
      message
   }
}
```

### Transferência (autenticado)
```graphql
mutation {
   createTransfer(remetente: "userA", destinatario: "userB", valor: 100) {
      remetente
      destinatario
      valor
   }
}
```
No playground, adicione o header:
```
{
   "Authorization": "Bearer SEU_TOKEN_AQUI"
}
```

## Observações
- Todas as mutations de transferência exigem autenticação JWT.
- O campo saldo é obrigatório no registro de usuário.



# PGATS-02-API

API REST e GraphQL para gerenciamento de usuários e transferências bancárias.

## Funcionalidades
- Registro de usuários (com opção de favorecido)
- Login e autenticação JWT
- Consulta, atualização e remoção de usuários
- Transferência de valores entre usuários
- Inserção de saldo na conta do usuário

## Tecnologias
- Node.js
- Express
- Apollo Server (GraphQL)
- Mocha (testes)
- Swagger (documentação)

## Instalação
```bash
npm install
```

## Uso da API REST
```bash
npm start
```
Acesse a documentação Swagger em: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Uso da API GraphQL
1. Instale as dependências adicionais:
    ```bash
    npm install apollo-server-express graphql jsonwebtoken
    ```
2. Inicie o servidor GraphQL:
    ```bash
    node graphql/server.js
    ```
3. Acesse o playground em: [http://localhost:4000/graphql](http://localhost:4000/graphql)

### Exemplos de Queries e Mutations

#### Registrar Usuário
```graphql
mutation {
   registerUser(login: "novo", senha: "123", favorecido: true) {
      message
   }
}
```

#### Login de Usuário
```graphql
mutation {
   loginUser(login: "novo", senha: "123") {
      token
      message
   }
}
```

#### Criar Transferência (requer token JWT)
```graphql
mutation {
   createTransfer(remetente: "novo", destinatario: "user2", valor: 100) {
      remetente
      destinatario
      valor
   }
}
```
No playground, adicione o header:
```
{
   "Authorization": "Bearer SEU_TOKEN_AQUI"
}
```

#### Consultar Usuários (requer token JWT)
```graphql
query {
   users {
      login
      favorecido
   }
}
```

#### Consultar Transferências (requer token JWT)
```graphql
query {
   transfers {
      remetente
      destinatario
      valor
   }
}
```

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
O relatório dos testes é publicado visualmente no summary do workflow, acessível diretamente pela interface do GitHub Actions, sem necessidade de download.

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