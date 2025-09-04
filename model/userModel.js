const users = [];


exports.addUser = (user) => {
  if (typeof user.saldo !== 'number') throw new Error('Saldo obrigatório no cadastro');
  users.push(user);
};

exports.clearUsers = () => {
  users.length = 0;
};

exports.findByLogin = (login) => {
  return users.find(u => u.login === login);
};

exports.getAllUsers = () => {
  return users;
};

exports.removeUser = (login) => {
  const idx = users.findIndex(u => u.login === login);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
};
