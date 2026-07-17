// Single entry point for data access. The rest of the app imports from here
// and never touches mockDb.js / mongoRepo.js directly, so swapping the
// database is a one-line change (DB_DRIVER in .env).

import mockDb from './mockDb.js';
import mongoRepo from './mongoRepo.js';
import sqliteRepo from './sqliteRepo.js';
import { connectMongo } from '../config/db.js';

const driver = process.env.DB_DRIVER || 'sqlite';

let repos;

export const initDb = async () => {
  if (driver === 'mongo') {
    await connectMongo();
    repos = mongoRepo;
  } else if (driver === 'sqlite') {
    console.log('Using SQLite database at data.sqlite');
    repos = sqliteRepo;
  } else {
    console.log('Using in-memory mock database (set DB_DRIVER=mongo or sqlite to use persistent stores)');
    repos = mockDb;
  }
};

// Lazily proxy so imports elsewhere can do: import { userRepo, productRepo } from '../db/index.js'
export const userRepo = new Proxy(
  {},
  { get: (_, prop) => (...args) => repos.userRepo[prop](...args) }
);

export const productRepo = new Proxy(
  {},
  { get: (_, prop) => (...args) => repos.productRepo[prop](...args) }
);
