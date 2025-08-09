
API REST para registro, login, consulta, atualização, remoção de usuários e transferência de valores.

## Instalação

1. Clone o repositório
2. Instale as dependências:
    ```bash
    npm install
    ```

## Uso

1. Inicie o servidor:
    ```bash
    npm start
    ```
2. Acesse a documentação Swagger em [http://localhost:3000/api-docs](http://localhost:3000/api-docs)



## Endpoints

### Autenticação
   - Body: `{ "login": "string", "senha": "string" }`
   - Resposta: `{ message, token }` (use o token nas demais rotas)

### Operações de Usuário
   - Registro: Body `{ "login": "string", "senha": "string", "favorecido": true|false }`
   - Atualização: Body `{ "login": "string", "senha": "string", "favorecido": true|false, "saldo": number }` (para inserir saldo, envie o campo "saldo" no PUT)
   - Header: `Authorization: Bearer <token>`
   - Query: `favorecido=true|false` (opcional)
   - Query: `login=string`

### Transações
   - Header: `Authorization: Bearer <token>`
   - Body: `{ "remetente": "string", "destinatario": "string", "valor": number }`
   - Header: `Authorization: Bearer <token>`
   - Query: `remetente=string` (opcional)

## Autenticação JWT

Após o login, utilize o token JWT retornado no campo `token` para acessar as rotas protegidas. Exemplo de uso:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/users
```

Tokens expiram em 10 minutos. Se o token estiver expirado ou inválido, a API retorna erro 401.


## Exemplos de Requisições

### Atualizar usuário e inserir saldo
```bash
curl -X PUT http://localhost:3000/users \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer <token>" \
   -d '{"login":"user1","saldo":10000}'
```
```



### Uso do token nas rotas protegidas

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

Os testes estão em `test/api.test.js` e cobrem todos os fluxos principais:

# Banco API

API REST para registro, login, consulta, atualização, remoção de usuários e transferências.

## Instalação e Uso
```bash
npm install
npm start
```
Acesse a documentação Swagger em [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Endpoints Principais
- `POST /users/register` — Registro de usuário
- `POST /users/login` — Login (retorna token JWT)
- `GET /users` — Consulta de usuários (token obrigatório)
- `PUT /users` — Atualização de usuário (token obrigatório)
- `DELETE /users` — Remoção de usuário (token obrigatório)
- `POST /transfer` — Transferência de valores (token obrigatório)
- `GET /transfer` — Consulta de transferências (token obrigatório)

## Autenticação
Faça login para obter o token JWT. Use o token no header `Authorization: Bearer <token>` nas rotas protegidas. O token expira em 10 minutos.

## Regras
- Login e senha obrigatórios
- Não permite usuários duplicados
- Transferências acima de R$ 5.000,00 só para favorecidos
- Transferências para não favorecidos: até R$ 5.000,00

## Testes
Execute `npm test` para rodar os testes automatizados.

---
API pronta para estudos de automação e testes!
curl -X DELETE "http://localhost:3000/users?login=user1"
