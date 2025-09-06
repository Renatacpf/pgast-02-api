const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../../../graphql/app');

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
    // Cria destinatário favorecido para garantir que a regra de saldo seja testada
    const destFav = 'fav_' + Date.now();
    await request(app)
      .post('/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: { login: destFav, senha: '456', favorecido: true, saldo: 0 }
      });
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: TRANSFER_MUTATION,
        variables: { remetente, destinatario: destFav, valor: 2000 }
      });
    expect(res.body.errors).to.exist;
    expect(res.body.errors[0].message).to.match(/Saldo insuficiente|Variable/);
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

  it('d) Registro duplicado', async function() {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: { login: remetente, senha: '123', favorecido: true, saldo: 1000 }
      });
    expect(res.body.errors).to.exist;
    expect(res.body.errors[0].message).to.match(/existe/);
  });

  it('e) Registro com campos obrigatórios ausentes', async function() {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: { login: '', senha: '', favorecido: true, saldo: null }
      });
  expect(res.body.errors).to.exist;
  expect(res.body.errors[0].message).to.match(/Variable.*must not be null/);
  });

  it('f) Login inválido', async function() {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: LOGIN_MUTATION,
        variables: { login: 'inexistente', senha: 'errada' }
      });
    expect(res.body.errors).to.exist;
    expect(res.body.errors[0].message).to.match(/inválidos/);
  });

  it('g) Atualizar usuário com sucesso', async function() {
    const UPDATE_MUTATION = `mutation Update($login: String!, $senha: String, $favorecido: Boolean, $saldo: Float) { updateUser(login: $login, senha: $senha, favorecido: $favorecido, saldo: $saldo) { message } }`;
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: UPDATE_MUTATION,
        variables: { login: remetente, senha: 'novaSenha', favorecido: true, saldo: 2000 }
      });
    expect(res.body.data.updateUser.message).to.match(/atualizado/);
  });

  it('h) Remover usuário com sucesso', async function() {
    const REMOVE_MUTATION = `mutation Remove($login: String!) { removeUser(login: $login) { message } }`;
    // Cria usuário para remover
    const loginRemover = 'userRemover_' + Date.now();
    await request(app)
      .post('/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: { login: loginRemover, senha: '123', favorecido: false, saldo: 100 }
      });
    // Login para token
    const loginRes = await request(app)
      .post('/graphql')
      .send({ query: LOGIN_MUTATION, variables: { login: loginRemover, senha: '123' } });
    const tokenRemover = loginRes.body.data.loginUser.token;
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${tokenRemover}`)
      .send({
        query: REMOVE_MUTATION,
        variables: { login: loginRemover }
      });
    expect(res.body.data.removeUser.message).to.match(/removido/);
  });

  it('i) Remover usuário inexistente', async function() {
    const REMOVE_MUTATION = `mutation Remove($login: String!) { removeUser(login: $login) { message } }`;
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: REMOVE_MUTATION,
        variables: { login: 'naoExiste_' + Date.now() }
      });
    expect(res.body.errors).to.exist;
    expect(res.body.errors[0].message).to.match(/não encontrado/);
  });

  it('j) Atualizar usuário inexistente', async function() {
    const UPDATE_MUTATION = `mutation Update($login: String!, $senha: String, $favorecido: Boolean, $saldo: Float) { updateUser(login: $login, senha: $senha, favorecido: $favorecido, saldo: $saldo) { message } }`;
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: UPDATE_MUTATION,
        variables: { login: 'naoExiste_' + Date.now(), senha: 'nova', favorecido: false, saldo: 100 }
      });
    expect(res.body.errors).to.exist;
    expect(res.body.errors[0].message).to.match(/não encontrado/);
  });

  it('k) Transferência acima do limite para não favorecido', async function() {
    // Cria novo destinatário não favorecido
    const novoDest = 'dest_' + Date.now();
    await request(app)
      .post('/graphql')
      .send({
        query: REGISTER_MUTATION,
        variables: { login: novoDest, senha: '456', favorecido: false, saldo: 0 }
      });
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: TRANSFER_MUTATION,
        variables: { remetente, destinatario: novoDest, valor: 6000 }
      });
    expect(res.body.errors).to.exist;
    expect(res.body.errors[0].message).to.match(/só para favorecidos/);
  });

  it('l) Consulta de usuários (Query)', async function() {
    const USERS_QUERY = `query { users { login favorecido saldo } }`;
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({ query: USERS_QUERY });
    expect(res.body.data.users).to.be.an('array');
    expect(res.body.data.users.length).to.be.greaterThan(0);
  });

  it('m) Consulta de transferências (Query)', async function() {
    const TRANSFERS_QUERY = `query { transfers { remetente destinatario valor } }`;
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({ query: TRANSFERS_QUERY });
    expect(res.body.data.transfers).to.be.an('array');
  });
});
