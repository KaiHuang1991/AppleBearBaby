import mongoose from "mongoose"

const connectDB = async()=>{
    mongoose.connection.on("connected" ,()=>{
        console.log("DB Connected");
    })
    
    mongoose.connection.on("error", (err)=>{
        console.log("DB Connection Error:", err.message);
    })
    
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // 增加超时时间到30秒
            socketTimeoutMS: 45000,
            bufferCommands: false, // 禁用命令缓冲，立即失败而不是等待
        })
        return true
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        console.log("Please check:");
        console.log("1. MongoDB service is running");
        console.log("2. MONGODB_URI in .env file is correct");
        console.log("3. Network connection is stable");
        throw error // 抛出错误，让服务器启动失败
    }
}
export default connectDB