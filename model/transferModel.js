const transfers = [];

exports.addTransfer = (transfer) => {
  transfers.push(transfer);
};

exports.getAllTransfers = () => {
  return transfers;
};
