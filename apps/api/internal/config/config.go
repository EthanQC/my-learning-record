package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	MySQLDSN    string
	Addr        string
	CORSOrigins []string
	AdminToken  string
	ContentDir  string
}

func Load() *Config {
	// 加载 .env 文件(如果存在)
	godotenv.Load()

	// 兼容单个和多个跨域来源:
	// 1) 优先读 CORS_ORIGINS (逗号分隔)
	// 2) 否则回退 CORS_ORIGIN
	// 3) 都没配置时，默认本地前端 http://localhost:3000
	corsOrigins := loadCORSOrigins()

	// ADDR 优先级: ADDR > API_ADDR(兼容旧配置) > 默认值
	addr := getEnv("ADDR", "")
	if addr == "" {
		addr = getEnv("API_ADDR", "127.0.0.1:9000")
	}

	return &Config{
		MySQLDSN:    getEnv("MYSQL_DSN", "root:pass@tcp(127.0.0.1:3306)/qingverse?parseTime=true&charset=utf8mb4"),
		Addr:        addr,
		CORSOrigins: corsOrigins,
		AdminToken:  os.Getenv("ADMIN_TOKEN"),
		ContentDir:  getEnv("CONTENT_DIR", "../../content"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func loadCORSOrigins() []string {
	if list := parseListEnv("CORS_ORIGINS"); len(list) > 0 {
		return list
	}

	if single := strings.TrimSpace(os.Getenv("CORS_ORIGIN")); single != "" {
		return []string{single}
	}

	return []string{"http://localhost:3000"}
}

func parseListEnv(key string) []string {
	raw := os.Getenv(key)
	if raw == "" {
		return nil
	}
	var res []string
	for _, s := range strings.Split(raw, ",") {
		if trimmed := strings.TrimSpace(s); trimmed != "" {
			res = append(res, trimmed)
		}
	}
	return uniqueStrings(res)
}

func uniqueStrings(in []string) []string {
	seen := make(map[string]struct{})
	var out []string
	for _, s := range in {
		if _, ok := seen[s]; ok {
			continue
		}
		seen[s] = struct{}{}
		out = append(out, s)
	}
	return out
}
