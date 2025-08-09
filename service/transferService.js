const userRepository = require('../model/userModel');
const transferRepository = require('../model/transferModel');

exports.transfer = (req, res) => {
  const { remetente, destinatario, valor } = req.body;
  if (!remetente || !destinatario || typeof valor !== 'number') {
    return res.status(400).json({ error: 'Campos obrigatórios: remetente, destinatario, valor.' });
  }
  const userFrom = userRepository.findByLogin(remetente);
  const userTo = userRepository.findByLogin(destinatario);
  if (!userFrom || !userTo) return res.status(404).json({ error: 'Usuário não encontrado.' });
  if (userFrom.saldo < valor) return res.status(400).json({ error: 'Saldo insuficiente.' });
  if (!userTo.favorecido && valor >= 5000) {
    return res.status(403).json({ error: 'Transferência acima de R$ 5.000,00 só para favorecidos.' });
  }
  userFrom.saldo -= valor;
  userTo.saldo += valor;
  transferRepository.addTransfer({ remetente, destinatario, valor, data: new Date().toISOString() });
  res.json({ message: 'Transferência realizada com sucesso.' });
};

exports.getAllTransfers = (req, res) => {
  const { remetente } = req.query;
  let transfers = transferRepository.getAllTransfers();
  if (remetente) {
    transfers = transfers.filter(t => t.remetente === remetente);
  }
  res.json(transfers);
};
