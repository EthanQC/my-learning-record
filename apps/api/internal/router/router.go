package router

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/EthanQC/my-learning-record/apps/api/internal/config"
	"github.com/EthanQC/my-learning-record/apps/api/internal/handler"
	"github.com/EthanQC/my-learning-record/apps/api/internal/middleware"
	"github.com/EthanQC/my-learning-record/apps/api/internal/service"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"
)

func Setup(db *sql.DB, cfg *config.Config) *chi.Mux {
	contactSvc := service.NewContactService(db)
	mdSvc := service.NewPostService(cfg.ContentDir)

	contactHandler := handler.NewContactHandler(contactSvc)
	postHandler := handler.NewPostHandler(mdSvc)
	statsHandler := handler.NewStatsHandler(mdSvc)

	r := chi.NewRouter()

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.CORSOrigin},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	r.Get("/swagger/*", httpSwagger.WrapHandler)

	r.Route("/api", func(r chi.Router) {
		r.Post("/contact", contactHandler.Create)
		r.With(middleware.RequireAdmin(cfg.AdminToken)).Get("/contact", contactHandler.List)

		r.Get("/posts", postHandler.List)
		r.Get("/categories", postHandler.Categories)
		r.Get("/stats", statsHandler.Get)

		// 文章详情路由
		r.Get("/posts/*", func(w http.ResponseWriter, req *http.Request) {
			// 获取完整路径,去掉 /api/posts/ 前缀
			fullPath := chi.URLParam(req, "*")

			// 调试日志
			log.Printf("[DEBUG] 请求路径: %s", req.URL.Path)
			log.Printf("[DEBUG] 提取的slug: %s", fullPath)

			// 直接使用完整路径作为 slug
			// 例如: blog/murmurs-and-reflection/2025.5.7
			post, err := mdSvc.GetPost(fullPath)
			if err != nil {
				log.Printf("[ERROR] 查找文章失败: %v, slug=%s", err, fullPath)
				handler.WriteError(w, http.StatusNotFound, "post not found: "+fullPath)
				return
			}
			handler.WriteJSON(w, http.StatusOK, post)
		})
	})

	return r
}
