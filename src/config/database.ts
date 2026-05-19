import mongoose from 'mongoose';

const connectDB = async (retryCount = 0) => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('🔄 Attempting MongoDB connection (attempt ' + (retryCount + 1) + ')...');

    await mongoose.connect(mongoURI, {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });

    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ MongoDB connection failed:', errorMessage.substring(0, 100));
    
    if (retryCount < 3) {
      console.log(`⏳ Retrying in 3 seconds... (${retryCount + 1}/3)`);
      return new Promise((resolve) => {
        setTimeout(() => {
          connectDB(retryCount + 1).then(resolve);
        }, 3000);
      });
    } else {
      console.warn('⚠️ MongoDB connection failed after 3 retries');
      console.warn('💡 Your backend will start but DB operations will fail');
      console.warn('💡 Check MongoDB Atlas status: https://cloud.mongodb.com');
      console.warn('💡 Check IP whitelist in MongoDB Atlas security settings');
      return false;
    }
  }
};

export default connectDB;
