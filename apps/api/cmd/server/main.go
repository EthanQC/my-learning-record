package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/EthanQC/my-learning-record/apps/api/internal/config"
	"github.com/EthanQC/my-learning-record/apps/api/internal/router"
	_ "github.com/go-sql-driver/mysql"

	_ "github.com/EthanQC/my-learning-record/apps/api/docs"
)

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
