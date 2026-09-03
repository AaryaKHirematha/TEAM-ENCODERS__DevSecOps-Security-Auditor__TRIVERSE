const IScanJobRepository = require('../../interfaces/IScanJobRepository');
const { RepositoryHealthState } = require('../../interfaces/IRepositoryHealth');

class MongoScanJobRepository extends IScanJobRepository {
  constructor(client) {
    super();
    this.client = client;
  }

  async getById(id) {
    throw new Error('Not implemented');
  }

  async save(job) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  async query(filter = {}) {
    throw new Error('Not implemented');
  }

  async checkHealth() {
    return RepositoryHealthState.UNAVAILABLE;
  }
}

module.exports = MongoScanJobRepository;
