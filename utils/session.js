
module.exports =
  (connection, fn) =>
  async (...args) => {
    const transactionSession = await connection.startSession();
    transactionSession.startTransaction();

    try {
      const result = await fn(transactionSession, ...args);
      await transactionSession.commitTransaction();
      return result;
    } catch (err) {
      await transactionSession.abortTransaction();
      throw err;
    } finally {
      await transactionSession.endSession();
    }
  };