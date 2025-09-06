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
   # API de Transferências e Usuários

   API REST e GraphQL para cadastro, consulta, atualização, remoção de usuários e transferências bancárias.

   ## Sumário
   - [Instalação](#instalação)
   - [Execução](#execução)
   - [Endpoints REST](#endpoints-rest)
   - [Mutations e Queries GraphQL](#graphql)
   - [Autenticação JWT](#autenticação-jwt)
   - [Regras de Negócio](#regras-de-negócio)
   - [Testes Automatizados](#testes-automatizados)

   ## Instalação
   ```bash
   npm install
   ```

   ## Execução
   ```bash
   npm start
   ```
   Acesse a documentação Swagger em: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

   ## Endpoints REST

   ### Cadastro
   - POST `/users/register`
      ```json
      {
         "login": "string",
         "senha": "string",
         "favorecido": true,
         "saldo": 1000
      }
      ```
   - POST `/users/login`
      ```json
      {
         "login": "string",
         "senha": "string"
      }
      ```

   ### Consulta
   - GET `/users` (protegido, requer token)
   - GET `/transfers` (protegido, requer token)

   ### Atualização
   - PUT `/users` (protegido, requer token)
      ```json
      {
         "login": "string",
         "senha": "string",
         "favorecido": true,
         "saldo": 2000
      }
      ```

   ### Remoção
   - DELETE `/users?login=string` (protegido, requer token)

   ### Transferência
   - POST `/transfers` (protegido, requer token)
      ```json
      {
         "remetente": "string",
         "destinatario": "string",
         "valor": 100
      }
      ```

   ## GraphQL

   ### Cadastro
   ```graphql
   mutation {
      registerUser(login: "userA", senha: "123", favorecido: true, saldo: 1000) {
         message
      }
   }
   ```

   ### Login
   ```graphql
   mutation {
      loginUser(login: "userA", senha: "123") {
         token
         message
      }
   }
   ```

   ### Consulta de usuários
   ```graphql
   query {
      users {
         login
         favorecido
         saldo
      }
   }
   ```

   ### Consulta de transferências
   ```graphql
   query {
      transfers {
         remetente
         destinatario
         valor
      }
   }
   ```

   ### Atualizar usuário
   ```graphql
   mutation {
      updateUser(login: "userA", senha: "novaSenha", favorecido: true, saldo: 2000) {
         message
      }
   }
   ```

   ### Remover usuário
   ```graphql
   mutation {
      removeUser(login: "userA") {
         message
      }
   }
   ```

   ### Transferência
   ```graphql
   mutation {
      createTransfer(remetente: "userA", destinatario: "userB", valor: 100) {
         remetente
         destinatario
         valor
      }
   }
   ```

   No playground GraphQL, adicione o header:
   ```
   {
      "Authorization": "Bearer SEU_TOKEN_AQUI"
   }
   ```

   ## Autenticação JWT
   Após o login, utilize o token JWT retornado para acessar rotas protegidas:
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:3000/users
   ```

   ## Regras de Negócio
   - Login, senha e saldo obrigatórios para registro
   - Login e senha obrigatórios para login
   - Não é permitido registrar usuários duplicados
   - Transferências acima de R$ 5.000,00 só para favorecidos
   - Transferências para não favorecidos só podem ser realizadas se o valor for menor que R$ 5.000,00
   - Saldo do remetente deve ser suficiente
   - Token expira em 10 minutos

   ## Testes Automatizados
   Execute todos os testes automatizados localmente:
   ```bash
   npm test
   ```
   Os testes cobrem todos os cenários das APIs REST e GraphQL, incluindo autenticação, regras de negócio, erros e integrações.

   ---
   Autor: Renata França
```

### Remover usuário (autenticado)
```graphql
mutation {
   removeUser(login: "userA") {
      message
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

## Autor
Renata França