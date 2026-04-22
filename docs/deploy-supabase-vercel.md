# Supabase + Vercel 部署步骤

## 1. 创建 Supabase 数据库
1. 打开 Supabase，新建一个 Project。
2. 进入 `Project Settings -> Database`。
3. 复制 `Connection string`（URI 格式），例如：
   `postgresql://postgres:密码@db.xxxxx.supabase.co:5432/postgres`

## 2. 配置 Vercel 环境变量
在 Vercel 项目 `Settings -> Environment Variables` 新增：
- `DATABASE_URL`：填 Supabase 的连接串
- `DATABASE_SSL`：`true`
- `ADMIN_PASSWORD`：你的后台密码

## 3. 部署
1. 把项目推送到 GitHub。
2. 在 Vercel 导入仓库并部署。
3. 部署成功后访问分配的域名。

## 4. 验证
1. 打开 `/tags`，点标签后刷新，票数应保留。
2. 打开 `/mailbox` 留言，去 `/admin` 登录后应能看到并管理留言。

