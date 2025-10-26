package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MySQLDSN   string
	Addr       string
	CORSOrigin string
	AdminToken string
	ContentDir string
}

func Load() *Config {
	// 加载 .env 文件(如果存在)
	godotenv.Load()

	return &Config{
		MySQLDSN:   getEnv("MYSQL_DSN", "root:pass@tcp(127.0.0.1:3306)/qingverse?parseTime=true&charset=utf8mb4"),
		Addr:       getEnv("ADDR", "127.0.0.1:9000"),
		CORSOrigin: getEnv("CORS_ORIGIN", "http://localhost:3000"),
		AdminToken: os.Getenv("ADMIN_TOKEN"),
		ContentDir: getEnv("CONTENT_DIR", "../../content"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
