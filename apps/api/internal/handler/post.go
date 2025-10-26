package handler

import (
	"net/http"
	"sort"

	"github.com/EthanQC/my-learning-record/apps/api/internal/model"
	"github.com/EthanQC/my-learning-record/apps/api/internal/service"
)

type PostHandler struct {
	mdService *service.PostService
}

func NewPostHandler(mdSvc *service.PostService) *PostHandler {
	return &PostHandler{mdService: mdSvc}
}

// List 获取文章列表
// @Summary      获取文章列表
// @Description  获取所有文章元信息,支持分类筛选
// @Tags         文章管理
// @Accept       json
// @Produce      json
// @Param        category  query     string  false  "分类筛选(如: murmurs-and-reflection)"
// @Success      200       {array}   model.PostMeta  "文章列表"
// @Failure      500       {object}  map[string]string  "服务器错误"
// @Router       /posts [get]
func (h *PostHandler) List(w http.ResponseWriter, r *http.Request) {
	posts, err := h.mdService.ListPosts()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list posts")
		return
	}

	sort.Slice(posts, func(i, j int) bool {
		return posts[i].Date.After(posts[j].Date)
	})

	category := r.URL.Query().Get("category")
	if category != "" {
		filtered := []model.PostMeta{}
		for _, p := range posts {
			if p.Category == category {
				filtered = append(filtered, p)
			}
		}
		posts = filtered
	}

	writeJSON(w, http.StatusOK, posts)
}

// Categories 获取分类列表
// @Summary      获取分类列表
// @Description  获取所有分类及文章数量统计
// @Tags         文章管理
// @Accept       json
// @Produce      json
// @Success      200  {array}   model.Category  "分类列表"
// @Failure      500  {object}  map[string]string  "服务器错误"
// @Router       /categories [get]
func (h *PostHandler) Categories(w http.ResponseWriter, r *http.Request) {
	categories, err := h.mdService.GetCategories()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get categories")
		return
	}
	writeJSON(w, http.StatusOK, categories)
}
