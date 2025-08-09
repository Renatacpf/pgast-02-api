const express = require('express');
const request = require('supertest');
const sinon = require('sinon');

let expect;
before(async () => {
	const chai = await import('chai');
	expect = chai.expect;
});

describe('User Controller', () => {
	let app;
	let userService;

		beforeEach(() => {
			delete require.cache[require.resolve('../../service/userService')];
			userService = require('../../service/userService');
			app = express();
			app.use(express.json());
		});

		it('deve registrar usuário novo', async () => {
			let receivedReq;
			const stub = sinon.stub(userService, 'register').callsFake((req, res) => {
				receivedReq = req.body;
				if (req.body.login && req.body.senha) {
					res.status(201).json({ message: 'Usuário registrado com sucesso.' });
				}
			});
			delete require.cache[require.resolve('../../controller/userController')];
			const userController = require('../../controller/userController');
			app.use('/user', userController);
			const res = await request(app)
				.post('/user/register')
				.send({ login: 'novo', senha: '123' });
			expect(receivedReq).to.deep.equal({ login: 'novo', senha: '123' });
			expect(res.status).to.equal(201);
			expect(res.body.message).to.equal('Usuário registrado com sucesso.');
			stub.restore();
		});

		it('não deve registrar usuário duplicado', async () => {
			let receivedReq;
			const stub = sinon.stub(userService, 'register').callsFake((req, res) => {
				receivedReq = req.body;
				if (req.body.login === 'existente') {
					res.status(409).json({ error: 'Usuário já existe.' });
				}
			});
			delete require.cache[require.resolve('../../controller/userController')];
			const userController = require('../../controller/userController');
			app.use('/user', userController);
			const res = await request(app)
				.post('/user/register')
				.send({ login: 'existente', senha: '123' });
			expect(receivedReq).to.deep.equal({ login: 'existente', senha: '123' });
			expect(res.status).to.equal(409);
			expect(res.body.error).to.equal('Usuário já existe.');
			stub.restore();
		});

		it('deve logar usuário válido e receber token', async () => {
			let receivedReq;
			const stub = sinon.stub(userService, 'login').callsFake((req, res) => {
				receivedReq = req.body;
				if (req.body.login === 'user' && req.body.senha === '123') {
					res.json({ message: 'Login realizado com sucesso.', token: 'fake-token' });
				}
			});
			delete require.cache[require.resolve('../../controller/userController')];
			const userController = require('../../controller/userController');
			app.use('/user', userController);
			const res = await request(app)
				.post('/user/login')
				.send({ login: 'user', senha: '123' });
			expect(receivedReq).to.deep.equal({ login: 'user', senha: '123' });
			expect(res.body.message).to.equal('Login realizado com sucesso.');
			expect(res.body.token).to.exist;
			stub.restore();
		});

		it('não deve logar com senha errada', async () => {
			let receivedReq;
			const stub = sinon.stub(userService, 'login').callsFake((req, res) => {
				receivedReq = req.body;
				if (req.body.login === 'user' && req.body.senha === '123') {
					res.json({ message: 'Login realizado com sucesso.', token: 'fake-token' });
				} else {
					res.status(401).json({ error: 'Credenciais inválidas.' });
				}
			});
			delete require.cache[require.resolve('../../controller/userController')];
			const userController = require('../../controller/userController');
			app.use('/user', userController);
			const res = await request(app)
				.post('/user/login')
				.send({ login: 'user', senha: 'errada' });
			expect(receivedReq).to.deep.equal({ login: 'user', senha: 'errada' });
			expect(res.status).to.equal(401);
			expect(res.body.error).to.equal('Credenciais inválidas.');
			stub.restore();
		});

		it('deve consultar todos os usuários', async () => {
			let receivedReq;
			const stub = sinon.stub(userService, 'getAll').callsFake((req, res) => {
				receivedReq = req.query;
				res.json([{ login: 'user1' }, { login: 'user2' }]);
			});
			delete require.cache[require.resolve('../../controller/userController')];
			const userController = require('../../controller/userController');
			app.use('/user', userController);
			const res = await request(app)
				.get('/user');
			expect(receivedReq).to.deep.equal({});
			expect(res.body).to.be.an('array');
			stub.restore();
		});

		it('deve atualizar usuário', async () => {
			let receivedReq;
			const stub = sinon.stub(userService, 'update').callsFake((req, res) => {
				receivedReq = req.body;
				if (req.body.login) {
					res.json({ message: 'Usuário atualizado com sucesso.' });
				} else {
					res.status(400).json({ error: 'Login obrigatório.' });
				}
			});
			delete require.cache[require.resolve('../../controller/userController')];
			const userController = require('../../controller/userController');
			app.use('/user', userController);
			const res = await request(app)
				.put('/user')
				.send({ login: 'user1', senha: 'nova' });
			expect(receivedReq).to.deep.equal({ login: 'user1', senha: 'nova' });
			expect(res.body.message).to.equal('Usuário atualizado com sucesso.');
			stub.restore();
		});

		it('deve remover usuário', async () => {
			let receivedReq;
			const stub = sinon.stub(userService, 'remove').callsFake((req, res) => {
				receivedReq = req.query;
				if (req.query.login === 'user1') {
					res.json({ message: 'Usuário removido com sucesso.' });
				}
			});
			delete require.cache[require.resolve('../../controller/userController')];
			const userController = require('../../controller/userController');
			app.use('/user', userController);
			const res = await request(app)
				.delete('/user')
				.query({ login: 'user1' });
			expect(receivedReq).to.deep.equal({ login: 'user1' });
			expect(res.body.message).to.equal('Usuário removido com sucesso.');
			stub.restore();
		});

		it('não deve remover usuário inexistente', async () => {
			let receivedReq;
			const stub = sinon.stub(userService, 'remove').callsFake((req, res) => {
				receivedReq = req.query;
				if (req.query.login === 'user1') {
					res.json({ message: 'Usuário removido com sucesso.' });
				} else {
					res.status(404).json({ error: 'Usuário não encontrado.' });
				}
			});
			delete require.cache[require.resolve('../../controller/userController')];
			const userController = require('../../controller/userController');
			app.use('/user', userController);
			const res = await request(app)
				.delete('/user')
				.query({ login: 'inexistente' });
			expect(receivedReq).to.deep.equal({ login: 'inexistente' });
			expect(res.status).to.equal(404);
			expect(res.body.error).to.equal('Usuário não encontrado.');
			stub.restore();
		});
});
