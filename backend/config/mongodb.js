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
        console.log("1. MongoDB service is running (or Atlas cluster is not paused)");
        console.log("2. MONGODB_URI in .env file is correct");
        console.log("3. Network connection is stable; Atlas Network Access allows your IP");
        if (String(error.message).includes("querySrv")) {
            console.log("4. querySrv failed: SRV DNS blocked or failing — try Atlas \"standard connection string\" (mongodb://host:27017,...) instead of mongodb+srv://, or switch DNS (e.g. 8.8.8.8)");
        }
        throw error // 抛出错误，让服务器启动失败
    }
}
export default connectDB