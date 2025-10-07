import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/doctors_appointment";

const run = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to DB");

    const collectionName = "appointments"; // adjust if your collection name differs
    const res = await mongoose.connection.db
      .collection(collectionName)
      .updateMany(
        { payment: { $exists: true } },
        { $rename: { payment: "confirmed" } }
      );

    console.log("Matched:", res.matchedCount, "Modified:", res.modifiedCount);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
