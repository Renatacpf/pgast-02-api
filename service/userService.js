const userRepository = require('../model/userModel');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret';

exports.register = (req, res) => {
  const { login, senha, favorecido } = req.body;
  if (!login || !senha) return res.status(400).json({ error: 'Login e senha obrigatórios.' });
  if (userRepository.findByLogin(login)) return res.status(409).json({ error: 'Usuário já existe.' });
  userRepository.addUser({ login, senha, favorecido: !!favorecido, saldo: 0 });
  res.status(201).json({ message: 'Usuário registrado com sucesso.' });
};

exports.login = (req, res) => {
  const { login, senha } = req.body;
  if (!login || !senha) return res.status(400).json({ error: 'Login e senha obrigatórios.' });
  const user = userRepository.findByLogin(login);
  if (!user || user.senha !== senha) return res.status(401).json({ error: 'Credenciais inválidas.' });
  // Gera token JWT válido por 10 minutos
  const token = jwt.sign({ login: user.login }, SECRET, { expiresIn: '10m' });
  res.json({ message: 'Login realizado com sucesso.', token });
};

exports.getAll = (req, res) => {
  const { favorecido } = req.query;
  let users = userRepository.getAllUsers();
  if (favorecido !== undefined) {
    users = users.filter(u => u.favorecido === (favorecido === 'true'));
  }
  res.json(users);
};

exports.update = (req, res) => {
  const { login, senha, favorecido, saldo } = req.body;
  if (!login) return res.status(400).json({ error: 'Login obrigatório.' });
  const user = userRepository.findByLogin(login);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  if (senha !== undefined) user.senha = senha;
  if (favorecido !== undefined) user.favorecido = !!favorecido;
  if (saldo !== undefined) user.saldo = saldo;
  res.json({ message: 'Usuário atualizado com sucesso.' });
};

exports.remove = (req, res) => {
  const { login } = req.query;
  if (!login) return res.status(400).json({ error: 'Login obrigatório.' });
  const removed = userRepository.removeUser(login);
  if (!removed) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ message: 'Usuário removido com sucesso.' });
};
