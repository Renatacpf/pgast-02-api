const users = [];

exports.addUser = (user) => {
  users.push(user);
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
