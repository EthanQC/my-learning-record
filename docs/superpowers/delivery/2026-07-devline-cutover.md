# Devline 切流交付说明

日期：2026-07-14（实际执行日期为准）

## 回滚信息（切流前记录，规格 §7A）

- 旧线上镜像 tag：API_TAG=c751b0c / WEB_TAG=c751b0c，REGISTRY=`<ACR私有仓库,真实地址见 GitHub secrets ACR_REGISTRY/ACR_NAMESPACE 与仓库外 phase4-rollback.md>`
- 切流前容器状态（`docker ps --format "{{.Names}}\t{{.Image}}\t{{.Status}}"` 原始输出）：
  ```
  qv-web    <ACR>/qingverse-web:c751b0c   Up 27 hours
  qv-api    <ACR>/qingverse-api:c751b0c   Up 27 hours
  qv-caddy  caddy:2                                                                                    Up 27 hours
  mysql8    mysql:8.0                                                                                  Up 31 hours (healthy)
  ```
- 旧配置备份：服务器 `/home/w/backups/pre-devline-cutover/`（`.env` / `docker-compose.yml` / `Caddyfile`，属主 w:w；注意：brief 原文写 `~/backups/...`，但服务器 SSH 登录用户是 root、部署用户是 w，`~` 在 root 会话下会解析到 `/root`，与仓库/部署所在的 `/home/w` 不一致——故本任务按 Task 1 已确认的路径修正，实际以 `sudo -u w` 在 `/home/w/backups/pre-devline-cutover/` 下创建备份，与仓库属主保持一致）
- 回滚步骤（§7A，路径已按上条修正为 `/home/w` 下的真实路径）：
  1. `cd /home/w/workspace/my-learning-record/deploy`
  2. `sudo -u w docker compose down`
  3. `sudo -u w cp /home/w/backups/pre-devline-cutover/{.env,docker-compose.yml,Caddyfile} .`
  4. `sudo -u w docker compose up -d`
  5. 旧镜像仍在 ACR（阿里云容器镜像服务，`<ACR私有仓库,真实地址见 GitHub secrets ACR_REGISTRY/ACR_NAMESPACE 与仓库外 phase4-rollback.md>`）；`docker image prune` 只清服务器本地悬挂镜像，不动 ACR 上的 `c751b0c` tag，回滚时可直接从 ACR 拉取旧镜像
- mysql-data 卷处置决定：**保留归档**（已定，不删除；本任务未触碰该卷，仅记录供 Task 7/8 执行时遵循与复核）

## 停机窗口

<Task 8 完成后填写：开始/结束时间、时长>

## 验证结果与未实测项

<Task 9–13 完成后逐条填写>
