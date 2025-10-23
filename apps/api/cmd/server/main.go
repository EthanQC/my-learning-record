package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/go-playground/validator/v10"
	_ "github.com/go-sql-driver/mysql"
)

var validate = validator.New()

type ContactReq struct {
	Name    string `json:"name" validate:"required,min=1,max=100"`
	Email   string `json:"email" validate:"required,email,max=200"`
	Message string `json:"message" validate:"required,min=5,max=5000"`
}

func main() {
	dsn := os.Getenv("MYSQL_DSN") // user:pass@tcp(127.0.0.1:3306)/qingverse?parseTime=true&charset=utf8mb4
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "https://qingverse.com", "https://www.qingverse.com"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	}))

	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte("ok")) })

	r.Post("/contact", func(w http.ResponseWriter, r *http.Request) {
		var req ContactReq
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "bad json", 400)
			return
		}
		if err := validate.Struct(req); err != nil {
			http.Error(w, err.Error(), 422)
			return
		}
		if _, err := db.Exec(`INSERT INTO contacts(name,email,message) VALUES(?,?,?)`, req.Name, req.Email, req.Message); err != nil {
			http.Error(w, "db error", 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"ok": true})
	})

	log.Println("api listening on 127.0.0.1:9000")
	http.ListenAndServe("127.0.0.1:9000", r)
}
