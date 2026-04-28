
require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("../models/Document");
const sampleData = require("../sampleData.json");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://admin:password@localhost:27017/docsearch?authSource=admin");
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    await Document.deleteMany({});
    console.log("Cleared existing documents");


    const documents = sampleData.sampleDocuments.map(doc => ({
      fileName: doc.fileName,
      content: doc.content,
      lastModified: new Date()
    }));

    await Document.insertMany(documents);
    console.log(`Successfully seeded ${documents.length} documents`);

    mongoose.connection.close();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
