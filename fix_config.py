#!/usr/bin/env python3
"""
修复 Nginx 配置文件中的 HTTP server 块
"""
import re
import sys

config_file = "/etc/nginx/sites-available/applebearbaby"

# 读取配置文件
with open(config_file, 'r') as f:
    content = f.read()

# 查找 HTTP server 块（listen 80）中的 location / 重定向
# 替换为代理配置
pattern = r'(server\s*\{[^}]*listen\s+80[^}]*location\s+/\s*\{)\s*return\s+301\s+https://\$server_name\$request_uri;\s*(\})'

replacement = r'''\1
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    \2'''

# 更精确的匹配：找到 listen 80 后的 location /
lines = content.split('\n')
new_lines = []
i = 0
in_http_server = False
in_location = False
location_start = -1

while i < len(lines):
    line = lines[i]
    
    # 检测进入 HTTP server 块
    if 'listen 80' in line or 'listen[::]:80' in line:
        in_http_server = True
    
    # 检测离开 server 块
    if in_http_server and line.strip() == '}' and not in_location:
        in_http_server = False
    
    # 在 HTTP server 块中检测 location /
    if in_http_server and 'location / {' in line:
        in_location = True
        location_start = i
        new_lines.append(line)
        i += 1
        # 跳过 return 301 行
        if i < len(lines) and 'return 301' in lines[i]:
            i += 1
        # 跳过 }
        if i < len(lines) and lines[i].strip() == '}':
            # 插入代理配置
            new_lines.append('        proxy_pass http://frontend;')
            new_lines.append('        proxy_http_version 1.1;')
            new_lines.append('        proxy_set_header Upgrade $http_upgrade;')
            new_lines.append('        proxy_set_header Connection \'upgrade\';')
            new_lines.append('        proxy_set_header Host $host;')
            new_lines.append('        proxy_set_header X-Real-IP $remote_addr;')
            new_lines.append('        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;')
            new_lines.append('        proxy_set_header X-Forwarded-Proto $scheme;')
            new_lines.append('        proxy_cache_bypass $http_upgrade;')
            new_lines.append('        proxy_read_timeout 300s;')
            new_lines.append('        proxy_connect_timeout 75s;')
            new_lines.append(lines[i])  # 添加 }
            in_location = False
            i += 1
            continue
    
    new_lines.append(line)
    i += 1

new_content = '\n'.join(new_lines)

# 写回文件
with open(config_file, 'w') as f:
    f.write(new_content)

print("配置文件已修复")

