const request = require('supertest');
const app = require('../app');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret';

describe('Banco API', function() {
  let user1 = { login: 'user1', senha: '123', favorecido: true };
  let user2 = { login: 'user2', senha: '456', favorecido: false };
  let token;

  it('deve registrar usuário novo', async function() {
    const res = await request(app).post('/users/register').send(user1);
    assert.strictEqual(res.status, 201);
    assert(res.body.message.includes('sucesso'));
  });

  it('não deve registrar usuário duplicado', async function() {
    const res = await request(app).post('/users/register').send(user1);
    assert.strictEqual(res.status, 409);
  });

  it('deve registrar outro usuário', async function() {
    const res = await request(app).post('/users/register').send(user2);
    assert.strictEqual(res.status, 201);
  });

  it('deve logar usuário válido e receber token', async function() {
    const res = await request(app).post('/users/login').send({ login: 'user1', senha: '123' });
    assert.strictEqual(res.status, 200);
    assert(res.body.message.includes('sucesso'));
    assert(res.body.token);
    token = res.body.token;
  });

  it('não deve logar com senha errada', async function() {
    const res = await request(app).post('/users/login').send({ login: 'user1', senha: 'errada' });
    assert.strictEqual(res.status, 401);
  });

  it('não deve acessar rotas protegidas sem token', async function() {
    const res = await request(app).get('/users');
    assert.strictEqual(res.status, 401);
    assert(res.body.error.includes('Token'));
  });

  it('não deve acessar rotas protegidas com token inválido', async function() {
    const res = await request(app).get('/users').set('Authorization', 'Bearer invalidtoken');
    assert.strictEqual(res.status, 401);
    assert(res.body.error.includes('inválido'));
  });

  it('não deve acessar rotas protegidas com token expirado', async function() {
    // Gera token expirado
    const expiredToken = jwt.sign({ login: 'user1' }, SECRET, { expiresIn: '-10s' });
    const res = await request(app).get('/users').set('Authorization', `Bearer ${expiredToken}`);
    assert.strictEqual(res.status, 401);
    assert(res.body.error.includes('expirado'));
  });

  it('deve consultar todos os usuários com token válido', async function() {
    const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body));
    assert(res.body.length >= 2);
  });

  it('deve atualizar usuário com token', async function() {
    const res = await request(app).put('/users').set('Authorization', `Bearer ${token}`).send({ login: 'user2', favorecido: true });
    assert.strictEqual(res.status, 200);
    assert(res.body.message.includes('atualizado'));
  });

  it('deve remover usuário com token', async function() {
    const res = await request(app).delete('/users').set('Authorization', `Bearer ${token}`).query({ login: 'user2' });
    assert.strictEqual(res.status, 200);
    assert(res.body.message.includes('removido'));
  });

  it('não deve remover usuário inexistente com token', async function() {
    const res = await request(app).delete('/users').set('Authorization', `Bearer ${token}`).query({ login: 'userX' });
    assert.strictEqual(res.status, 404);
  });

  it('deve transferir valor para favorecido com token', async function() {
    // Adiciona saldo ao user1
    await request(app).put('/users').set('Authorization', `Bearer ${token}`).send({ login: 'user1', saldo: 10000 });
    const res = await request(app).post('/transfer').set('Authorization', `Bearer ${token}`).send({ remetente: 'user1', destinatario: 'user1', valor: 6000 });
    assert.strictEqual(res.status, 200);
  });

  it('não deve transferir valor alto para não favorecido com token', async function() {
    // Adiciona saldo ao user1
    await request(app).put('/users').set('Authorization', `Bearer ${token}`).send({ login: 'user1', saldo: 10000 });
    await request(app).post('/users/register').send({ login: 'user3', senha: '789', favorecido: false });
    await request(app).put('/users').set('Authorization', `Bearer ${token}`).send({ login: 'user3', saldo: 10000 });
    const res = await request(app).post('/transfer').set('Authorization', `Bearer ${token}`).send({ remetente: 'user1', destinatario: 'user3', valor: 6000 });
    assert.strictEqual(res.status, 403);
  });

  it('deve transferir valor baixo para não favorecido com token', async function() {
    await request(app).put('/users').set('Authorization', `Bearer ${token}`).send({ login: 'user3', saldo: 10000 });
    const res = await request(app).post('/transfer').set('Authorization', `Bearer ${token}`).send({ remetente: 'user1', destinatario: 'user3', valor: 100 });
    assert.strictEqual(res.status, 200);
  });

  it('deve consultar transferências com token', async function() {
    const res = await request(app).get('/transfer').set('Authorization', `Bearer ${token}`).query({ remetente: 'user1' });
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body));
  });
});
