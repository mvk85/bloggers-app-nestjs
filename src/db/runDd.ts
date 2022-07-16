import mongoose from 'mongoose';

const mongoUri = process.env.mongoURI || 'mongodb://0.0.0.0:27017';
const dbName = process.env.mongoDBName || 'social';

export async function runDb() {
  try {
    await mongoose.connect(mongoUri, { dbName });

    console.log('Connected successfully to mongo server');
  } catch {
    console.log("Can't connect to db");
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
  }
}
