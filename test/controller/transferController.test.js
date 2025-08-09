const express = require('express');
let expect;
const request = require('supertest');
const sinon = require('sinon');

describe('Transfer Controller', () => {
	let app;
	let transferService;

		beforeEach(async () => {
		delete require.cache[require.resolve('../../service/transferService')];
			transferService = require('../../service/transferService');
			// Importa chai dinamicamente para evitar erro de ES Module
			if (!expect) {
				const chai = await import('chai');
				expect = chai.expect;
			}
		app = express();
		app.use(express.json());
	});

		function mountController() {
			delete require.cache[require.resolve('../../controller/transferController')];
			const transferController = require('../../controller/transferController');
			app.use('/transfer', transferController);
		}

		it('Quando informo remetente, destinatário e valor válidos recebo 200', async () => {
		const stub = sinon.stub(transferService, 'transfer').callsFake((req, res) => {
			res.status(200).json({ message: 'ok' });
		});
		mountController();
		const res = await request(app)
			.post('/transfer')
			.send({ remetente: 'user1', destinatario: 'user2', valor: 100 });
		expect(res.status).to.equal(200);
		expect(res.body.message).to.equal('ok');
		stub.restore();
	});

		it('Quando consulto transferências recebo 200 e um array', async () => {
		const stub = sinon.stub(transferService, 'getAllTransfers').callsFake((req, res) => {
			res.status(200).json([{ remetente: 'user1', destinatario: 'user2', valor: 100 }]);
		});
		mountController();
		const res = await request(app)
			.get('/transfer');
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('array');
		stub.restore();
	});

		it('Quando informo campos obrigatórios ausentes recebo 400', async () => {
		const stub = sinon.stub(transferService, 'transfer').callsFake((req, res) => {
			if (!req.body.remetente || !req.body.destinatario || typeof req.body.valor !== 'number') {
				return res.status(400).json({ error: 'Campos obrigatórios: remetente, destinatario, valor.' });
			}
			res.status(200).json({ message: 'ok' });
		});
		mountController();
		const res = await request(app)
			.post('/transfer')
			.send({ remetente: '', destinatario: '', valor: null });
		expect(res.status).to.equal(400);
		expect(res.body.error).to.equal('Campos obrigatórios: remetente, destinatario, valor.');
		stub.restore();
	});

		it('Quando informo remetente e destinatário inexistentes recebo 404', async () => {
		const stub = sinon.stub(transferService, 'transfer').callsFake((req, res) => {
			if (req.body.remetente === 'inexistente' || req.body.destinatario === 'inexistente') {
				return res.status(404).json({ error: 'Usuário não encontrado.' });
			}
			res.status(200).json({ message: 'ok' });
		});
		mountController();
		const res = await request(app)
			.post('/transfer')
			.send({ remetente: 'inexistente', destinatario: 'inexistente', valor: 100 });
		expect(res.status).to.equal(404);
		expect(res.body.error).to.equal('Usuário não encontrado.');
		stub.restore();
	});

		it('Quando informo valor acima de 5000 para não favorecido recebo 403', async () => {
		const stub = sinon.stub(transferService, 'transfer').callsFake((req, res) => {
			if (req.body.valor > 5000 && req.body.destinatario === 'user2') {
				return res.status(403).json({ error: 'Transferência acima de R$ 5.000,00 só para favorecidos.' });
			}
			res.status(200).json({ message: 'ok' });
		});
		mountController();
		const res = await request(app)
			.post('/transfer')
			.send({ remetente: 'user1', destinatario: 'user2', valor: 6000 });
		expect(res.status).to.equal(403);
		expect(res.body.error).to.equal('Transferência acima de R$ 5.000,00 só para favorecidos.');
		stub.restore();
	});
});
