const mongoose = require('mongoose');
const IUnitOfWork = require('../../interfaces/IUnitOfWork');
const MongoScanJobRepository = require('./MongoScanJobRepository');
const MongoScanResultRepository = require('./MongoScanResultRepository');
const MongoEventRepository = require('./MongoEventRepository');

class MongoUnitOfWork extends IUnitOfWork {
  constructor() {
    super();
    this.connection = mongoose.connection;
    this.scanJobs = new MongoScanJobRepository(this.connection);
    this.scanResults = new MongoScanResultRepository(this.connection);
    this.events = new MongoEventRepository(this.connection);
  }

  async begin() {
    // Mongo transactions require replica sets. 
    // To support standalone mongo, we just no-op begin/commit/rollback
    // Real transaction logic would go here if replica set is guaranteed.
  }

  async commit() {
    // No-op for standalone compatibility.
  }

  async rollback() {
    // No-op for standalone compatibility.
  }

  async close() {
    await mongoose.disconnect();
  }
}

module.exports = MongoUnitOfWork;
