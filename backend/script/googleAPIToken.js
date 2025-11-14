import { google } from 'googleapis';
import * as readline from 'readline/promises';
import * as fs from 'fs/promises';
import { stdin as input, stdout as output } from 'process';
import dotenv from 'dotenv'
dotenv.config();

const getRefreshToken = async () => {
    // 检查必需的环境变量
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error('错误: 请在.env文件中设置GOOGLE_CLIENT_ID和GOOGLE_CLIENT_SECRET');
        console.error('示例:');
        console.error('GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com');
        console.error('GOOGLE_CLIENT_SECRET=your_client_secret');
        process.exit(1);
    }
    
    console.log('使用CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    // 配置 OAuth 2.0 客户端
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000"
    );
    const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

    // 生成授权 URL
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline', // 确保返回 refresh_token
        scope: SCOPES,
    });

    console.log('请在浏览器中打开以下链接授权:', authUrl);

    // 创建 readline 接口
    const rl = readline.createInterface({
        input,
        output,
    });

    try {
        // 提示用户输入授权码
        const code = await rl.question('输入授权码: ');
        // 获取 token
        const { tokens } = await oauth2Client.getToken(code);
        console.log('Tokens:', tokens);

        // 保存 refresh_token 到 .env 文件
        if (tokens.refresh_token) {
            await fs.appendFile(
                '.env',
                `\nREFRESH_TOKEN=${tokens.refresh_token}`
            );
            console.log('Refresh token 已保存到 .env 文件');
        } else {
            console.log('未获取到 refresh_token，请检查授权流程');
        }
    } catch (error) {
        console.error('获取 token 失败:', error);
    } finally {
        rl.close();
    }
};

getRefreshToken();