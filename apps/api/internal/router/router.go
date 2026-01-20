package router

import (
	"database/sql"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"

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
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	r.Get("/swagger/*", httpSwagger.WrapHandler)

	// 静态图片服务 - 服务 content 目录下的所有图片
	imageHandler := func(w http.ResponseWriter, req *http.Request) {
		imagePath := chi.URLParam(req, "*")
		decodedPath, err := url.PathUnescape(imagePath)
		if err != nil {
			http.Error(w, "invalid path", http.StatusBadRequest)
			return
		}

		// 安全检查：防止路径遍历攻击
		if strings.Contains(decodedPath, "..") {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}

		fullPath := filepath.Join(cfg.ContentDir, decodedPath)

		// 检查文件是否存在
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}

		// 设置缓存头
		w.Header().Set("Cache-Control", "public, max-age=31536000")
		http.ServeFile(w, req, fullPath)
	}
	r.Get("/images/*", imageHandler)

	r.Route("/api", func(r chi.Router) {
		// 兼容 /api/images 路径（前端 markdown 使用）
		r.Get("/images/*", imageHandler)

		r.Post("/contact", contactHandler.Create)
		r.With(middleware.RequireAdmin(cfg.AdminToken)).Get("/contact", contactHandler.List)

		r.Get("/posts", postHandler.List)
		r.Get("/categories", postHandler.Categories)
		r.Get("/stats", statsHandler.Get)

		// 文章详情路由
		r.Get("/posts/*", func(w http.ResponseWriter, req *http.Request) {
			// 获取完整路径,去掉 /api/posts/ 前缀
			rawSlug := chi.URLParam(req, "*")
			decodedSlug, err := url.PathUnescape(rawSlug)
			if err != nil {
				log.Printf("[ERROR] slug 解码失败: %v, raw=%s", err, rawSlug)
				handler.WriteError(w, http.StatusBadRequest, "invalid slug")
				return
			}

			// 直接使用完整路径作为 slug
			// 例如: blog/murmurs-and-reflection/2025.5.7
			post, err := mdSvc.GetPost(decodedSlug)
			if err != nil {
				log.Printf("[ERROR] 查找文章失败: %v, slug=%s", err, decodedSlug)
				handler.WriteError(w, http.StatusNotFound, "post not found: "+decodedSlug)
				return
			}
			handler.WriteJSON(w, http.StatusOK, post)
		})
	})

	return r
}
