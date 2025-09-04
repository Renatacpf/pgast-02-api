const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../../graphql/app');

const TRANSFER_MUTATION = `mutation Transfer($remetente: String!, $destinatario: String!, $valor: Float!) {
  createTransfer(remetente: $remetente, destinatario: $destinatario, valor: $valor) {
    remetente
    destinatario
    valor
  }
}`;

const REGISTER_MUTATION = `mutation Register($login: String!, $senha: String!, $favorecido: Boolean, $saldo: Float!) {
  registerUser(login: $login, senha: $senha, favorecido: $favorecido, saldo: $saldo) { message }
}`;

const LOGIN_MUTATION = `mutation Login($login: String!, $senha: String!) {
  loginUser(login: $login, senha: $senha) { token }
}`;

describe('GraphQL Mutation: createTransfer', function() {
  let token;
  let remetente = 'userA_' + Date.now();
  let destinatario = 'userB_' + Date.now();

  before(async function() {
    // Registra usuários
    await request(app)
      .post('/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: { login: remetente, senha: '123', favorecido: true, saldo: 1000 }
      });
    await request(app)
      .post('/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: { login: destinatario, senha: '456', favorecido: false, saldo: 0 }
      });
    // Login remetente
    const res = await request(app)
      .post('/graphql')
      .send({ query: LOGIN_MUTATION, variables: { login: remetente, senha: '123' } });
    // Log para depuração
    // eslint-disable-next-line no-console
    console.log('LOGIN RESPONSE:', JSON.stringify(res.body, null, 2));
    token = res.body && res.body.data && res.body.data.loginUser ? res.body.data.loginUser.token : null;
    if (!token) throw new Error('Token JWT não gerado. Resposta: ' + JSON.stringify(res.body));
  });

  it('a) Transferência com sucesso', async function() {
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: TRANSFER_MUTATION,
        variables: { remetente, destinatario, valor: 100 }
      });
    expect(res.body.data.createTransfer.remetente).to.equal(remetente);
    expect(res.body.data.createTransfer.destinatario).to.equal(destinatario);
    expect(res.body.data.createTransfer.valor).to.equal(100);
  });

  it('b) Sem saldo disponível para transferência', async function() {
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: TRANSFER_MUTATION,
        variables: { remetente, destinatario, valor: 99999 }
      });
    expect(res.body.errors).to.exist;
    expect(res.body.errors[0].message).to.match(/Saldo insuficiente|Campos obrigatórios/);
  });

  it('c) Token de autenticação não informado', async function() {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: TRANSFER_MUTATION,
        variables: { remetente, destinatario, valor: 50 }
      });
    expect(res.body.errors).to.exist;
    expect(res.body.errors[0].message).to.match(/Token obrigatório|Token inválido|ausente/);
  });
});
