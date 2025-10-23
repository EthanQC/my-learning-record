// apps/api/cmd/server/main.go
package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-playground/validator/v10"
	_ "github.com/go-sql-driver/mysql"
)

type App struct {
	DB         *sql.DB
	Validate   *validator.Validate
	AdminToken string
}

// ContactIn: subject 可选
type ContactIn struct {
	Name     string `json:"name"   validate:"required,min=1,max=100"`
	Email    string `json:"email"  validate:"required,email,max=200"`
	Message  string `json:"message" validate:"required,min=1"`
	Honeypot string `json:"_honey,omitempty"` // 简单反爬：蜜罐字段，前端会传空，机器人常会填
}

type ContactOut struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

func main() {
	dsn := env("MYSQL_DSN", "root:pass@tcp(127.0.0.1:3306)/qingverse?parseTime=true&charset=utf8mb4")
	origin := env("CORS_ORIGIN", "http://localhost:3000")
	adminToken := os.Getenv("ADMIN_TOKEN")

	db, err := sql.Open("mysql", dsn)
	must(err)
	must(db.Ping())

	app := &App{
		DB:         db,
		Validate:   validator.New(validator.WithRequiredStructEnabled()),
		AdminToken: adminToken,
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{origin}, // 本地联调：http://localhost:3000
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("OK"))
	})

	r.Route("/api", func(r chi.Router) {
		r.Post("/contact", app.createContact)

		// 管理端拉取留言（可选）
		r.With(app.requireAdmin).Get("/contact", app.listContacts)
	})

	addr := env("ADDR", "127.0.0.1:9000")
	log.Printf("api listening on http://%s", addr)
	must(http.ListenAndServe(addr, r))
}

func (a *App) createContact(w http.ResponseWriter, r *http.Request) {
	var in ContactIn
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		httpError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if strings.TrimSpace(in.Honeypot) != "" {
		// 机器人命中蜜罐，直接返回 ok
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
		return
	}
	if err := a.Validate.Struct(in); err != nil {
		httpError(w, http.StatusBadRequest, err.Error())
		return
	}

	// 只插入现有的四个字段
	res, err := a.DB.Exec(
		`INSERT INTO contacts(name,email,message,created_at) VALUES (?,?,?,NOW())`,
		in.Name, in.Email, in.Message,
	)
	if err != nil {
		log.Printf("createContact insert error: %v", err)
		httpError(w, http.StatusInternalServerError, "db error")
		return
	}

	id, _ := res.LastInsertId()
	row := a.DB.QueryRow(
		`SELECT id,name,email,message,created_at FROM contacts WHERE id=?`, id,
	)
	var out ContactOut
	if err := row.Scan(&out.ID, &out.Name, &out.Email, &out.Message, &out.CreatedAt); err != nil {
		log.Printf("createContact select error: %v", err)
		httpError(w, http.StatusInternalServerError, "db error")
		return
	}
	writeJSON(w, http.StatusCreated, out)
}

func (a *App) listContacts(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`SELECT id,name,email,subject,message,created_at
							 FROM contacts ORDER BY created_at DESC LIMIT 200`)
	if err != nil {
		httpError(w, http.StatusInternalServerError, "db error")
		return
	}
	defer rows.Close()

	var list []ContactOut
	for rows.Next() {
		var c ContactOut
		if err := rows.Scan(&c.ID, &c.Name, &c.Email, &c.Message, &c.CreatedAt); err != nil {
			httpError(w, http.StatusInternalServerError, "db error")
			return
		}
		list = append(list, c)
	}
	writeJSON(w, http.StatusOK, list)
}

func (a *App) requireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if a.AdminToken == "" {
			httpError(w, http.StatusForbidden, "admin disabled")
			return
		}
		if r.Header.Get("X-Admin-Token") != a.AdminToken {
			httpError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func httpError(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}

func must(err error) {
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
