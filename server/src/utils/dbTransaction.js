const mongoose = require('mongoose');

const withTransaction = async (operation) => {
  const session = await mongoose.startSession();
  try {
    let result;
    const isReplicaSet = !!mongoose.connection.client.topology?.description?.setName ||
      mongoose.connection.client.topology?.description?.type === 'ReplicaSetWithPrimary';

    if (isReplicaSet) {
      await session.withTransaction(async () => {
        result = await operation(session);
      });
    } else {
      result = await operation(null);
    }
    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = { withTransaction };