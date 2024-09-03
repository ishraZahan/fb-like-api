const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const dbconnection = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with a failure code
  }
};

module.exports=dbconnection;
