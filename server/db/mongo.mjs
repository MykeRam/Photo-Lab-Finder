import { MongoClient } from "mongodb";

const databaseName = process.env.MONGODB_DB_NAME ?? "photo-lab-finder";

let dbPromise;

async function createDbConnection() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return null;
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(databaseName);
  const labs = db.collection("labs");

  await Promise.all([
    labs.createIndex({ placeSource: 1, placeId: 1 }, { unique: true }),
    labs.createIndex({ borough: 1, neighborhood: 1, "address.zip": 1 }),
    labs.createIndex({ locationGeo: "2dsphere" }),
    labs.createIndex({ tags: 1 }),
  ]);

  return db;
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = createDbConnection().catch((error) => {
      dbPromise = undefined;
      throw error;
    });
  }

  return dbPromise;
}
