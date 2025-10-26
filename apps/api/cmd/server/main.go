package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/EthanQC/my-learning-record/apps/api/internal/config"
	"github.com/EthanQC/my-learning-record/apps/api/internal/router"
	_ "github.com/go-sql-driver/mysql"

	// 导入自动生成的 docs 包
	_ "github.com/EthanQC/my-learning-record/apps/api/docs"
)

// @title           Qingverse API
// @version         1.0
// @description     个人学习记录网站 API - 支持博客文章、笔记和留言管理
// @contact.name    Ethan
// @contact.email   2367918546@qq.com
// @host            localhost:9000
// @BasePath        /api
// @schemes         http https
func main() {
	cfg := config.Load()

	db, err := sql.Open("mysql", cfg.MySQLDSN)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	r := router.Setup(db, cfg)

	log.Printf("API server listening on http://%s", cfg.Addr)
	log.Printf("📖 Swagger UI: http://%s/swagger/index.html", cfg.Addr)
	log.Fatal(http.ListenAndServe(cfg.Addr, r))
}
