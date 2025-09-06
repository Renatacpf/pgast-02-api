const userService = require('../service/userService');
const userModel = require('../model/userModel');
const transferService = require('../service/transferService');
const jwt = require('jsonwebtoken');
const { SECRET, getUserFromToken } = require('./auth');

module.exports = {
  Query: {
    users: (parent, args, context) => {
      if (!context.user) throw new Error('Token inválido ou ausente');
      return userService.getAllUsers();
    },
    transfers: (parent, args, context) => {
      if (!context.user) throw new Error('Token inválido ou ausente');
      return transferService.getAllTransfers();
    },
  },
  Mutation: {
    registerUser: (parent, { login, senha, favorecido, saldo }) => {
      if (!login || !senha || typeof saldo !== 'number') {
        return { message: 'Login, senha e saldo obrigatórios.' };
      }
      const exists = userModel.findByLogin(login);
      if (exists) return { message: 'Usuário já existe.' };
      userModel.addUser({ login, senha, favorecido, saldo });
      return { message: 'Usuário registrado com sucesso.' };
    },
    loginUser: (parent, { login, senha }) => {
      const user = userModel.findByLogin(login);
      if (!user || user.senha !== senha) {
        return { token: null, message: 'Login ou senha inválidos.' };
      }
      const token = jwt.sign({ login: user.login }, SECRET, { expiresIn: '1h' });
      return { token, message: 'Login realizado com sucesso.' };
    },
    createTransfer: (parent, { remetente, destinatario, valor }, context) => {
      if (!context.user) throw new Error('Token obrigatório para transferências');
      if (!remetente || !destinatario || typeof valor !== 'number') {
        throw new Error('Campos obrigatórios: remetente, destinatario, valor.');
      }
      const userRepository = require('../model/userModel');
      const transferRepository = require('../model/transferModel');
      const userFrom = userRepository.findByLogin(remetente);
      const userTo = userRepository.findByLogin(destinatario);
      if (!userFrom || !userTo) throw new Error('Usuário não encontrado.');
      if (userFrom.saldo < valor) throw new Error('Saldo insuficiente.');
      if (!userTo.favorecido && valor >= 5000) {
        throw new Error('Transferência acima de R$ 5.000,00 só para favorecidos.');
      }
      userFrom.saldo -= valor;
      userTo.saldo += valor;
      transferRepository.addTransfer({ remetente, destinatario, valor, data: new Date().toISOString() });
      return { remetente, destinatario, valor };
    },

    updateUser: (parent, { login, senha, favorecido, saldo }, context) => {
      if (!context.user) throw new Error('Token inválido ou ausente');
      if (!login) throw new Error('Login obrigatório.');
      const userRepository = require('../model/userModel');
      const user = userRepository.findByLogin(login);
      if (!user) throw new Error('Usuário não encontrado.');
      if (senha !== undefined) user.senha = senha;
      if (favorecido !== undefined) user.favorecido = !!favorecido;
      if (saldo !== undefined) user.saldo = saldo;
      return { message: 'Usuário atualizado com sucesso.' };
    },

    removeUser: (parent, { login }, context) => {
      if (!context.user) throw new Error('Token inválido ou ausente');
      if (!login) throw new Error('Login obrigatório.');
      const userRepository = require('../model/userModel');
      const removed = userRepository.removeUser(login);
      if (!removed) throw new Error('Usuário não encontrado.');
      return { message: 'Usuário removido com sucesso.' };
    },
  },
};
