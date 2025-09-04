const { gql } = require('apollo-server-express');

module.exports = gql`
  type User {
    login: String!
    senha: String!
    favorecido: Boolean
    saldo: Float!
  }

  type Transfer {
    remetente: String!
    destinatario: String!
    valor: Float!
  }

  type AuthPayload {
    token: String
    message: String
  }

  type Query {
    users: [User]
    transfers: [Transfer]
  }

  type Mutation {
    registerUser(login: String!, senha: String!, favorecido: Boolean, saldo: Float!): AuthPayload
    loginUser(login: String!, senha: String!): AuthPayload
    "Mutation de transferência exige autenticação JWT via header Authorization"
    createTransfer(remetente: String!, destinatario: String!, valor: Float!): Transfer
  }
`;
