import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  return uri;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = getMongoUri(); 

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: "orderflow",
      autoIndex: true,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
