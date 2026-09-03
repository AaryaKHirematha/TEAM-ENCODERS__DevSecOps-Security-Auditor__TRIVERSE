const path = require('path');
const os = require('os');
const JsonScanJobRepository = require('../providers/json/JsonScanJobRepository');
const JsonScanResultRepository = require('../providers/json/JsonScanResultRepository');
const JsonEventRepository = require('../providers/json/JsonEventRepository');
const JsonUnitOfWork = require('../providers/json/JsonUnitOfWork');

const MetricsRepositoryDecorator = require('../decorators/MetricsRepositoryDecorator');
const LoggingRepositoryDecorator = require('../decorators/LoggingRepositoryDecorator');
const EventPublishingRepositoryDecorator = require('../decorators/EventPublishingRepositoryDecorator');

class RepositoryFactory {
  static createUnitOfWork(config = {}) {
    const type = config.type || process.env.PERSISTENCE_PROVIDER || 'json';

    let scanJobRepo;
    let scanResultRepo;
    let eventRepo;
    let unitOfWork;

    if (type === 'json') {
      const dbDir = process.env.VERCEL ? os.tmpdir() : path.join(__dirname, '..', '..', '..');
      
      const scanJobsPath = path.join(dbDir, 'secaudit-jobs.json');
      const scanResultsPath = path.join(dbDir, 'secaudit-results.json');
      const eventsPath = path.join(dbDir, 'secaudit-events.json');

      scanJobRepo = new JsonScanJobRepository(scanJobsPath);
      scanResultRepo = new JsonScanResultRepository(scanResultsPath);
      eventRepo = new JsonEventRepository(eventsPath);

      // Apply decorators
      scanJobRepo = this._decorate(scanJobRepo, 'ScanJobRepository', 'ScanJob');
      scanResultRepo = this._decorate(scanResultRepo, 'ScanResultRepository', 'ScanResult');
      eventRepo = this._decorate(eventRepo, 'EventRepository', 'Event');

      unitOfWork = new JsonUnitOfWork(scanJobRepo, scanResultRepo, eventRepo);
    } else if (type === 'postgres') {
      throw new Error('Postgres provider not yet fully implemented');
    } else if (type === 'mongo') {
      throw new Error('Mongo provider not yet fully implemented');
    } else if (type === 'redis') {
      throw new Error('Redis provider not yet fully implemented');
    } else {
      throw new Error(`Unsupported persistence provider type: ${type}`);
    }

    return unitOfWork;
  }

  static _decorate(repo, name, entityName) {
    let decoratedRepo = repo;
    decoratedRepo = new EventPublishingRepositoryDecorator(decoratedRepo, entityName);
    decoratedRepo = new MetricsRepositoryDecorator(decoratedRepo, name);
    // Logging decorator can be chatty, enable via env or config if desired
    if (process.env.DB_LOGGING === 'true') {
      decoratedRepo = new LoggingRepositoryDecorator(decoratedRepo, name);
    }
    return decoratedRepo;
  }
}

module.exports = RepositoryFactory;
