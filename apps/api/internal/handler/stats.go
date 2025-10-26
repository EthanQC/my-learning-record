package handler

import (
	"net/http"
	"sort"

	"github.com/EthanQC/my-learning-record/apps/api/internal/model"
	"github.com/EthanQC/my-learning-record/apps/api/internal/service"
)

type StatsHandler struct {
	mdService *service.PostService
}

func NewStatsHandler(mdSvc *service.PostService) *StatsHandler {
	return &StatsHandler{mdService: mdSvc}
}

// Get 获取统计信息
// @Summary      获取网站统计
// @Description  获取文章总数、分类数、最近更新等统计信息
// @Tags         统计
// @Accept       json
// @Produce      json
// @Success      200  {object}  model.Stats  "统计数据"
// @Failure      500  {object}  map[string]string  "服务器错误"
// @Router       /stats [get]
func (h *StatsHandler) Get(w http.ResponseWriter, r *http.Request) {
	posts, err := h.mdService.ListPosts()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get stats")
		return
	}

	categories, _ := h.mdService.GetCategories()

	sort.Slice(posts, func(i, j int) bool {
		return posts[i].Date.After(posts[j].Date)
	})

	recent := posts
	if len(recent) > 5 {
		recent = recent[:5]
	}

	var lastUpdate = posts[0].Date
	if len(posts) > 0 {
		lastUpdate = posts[0].Date
	}

	stats := model.Stats{
		TotalPosts:      len(posts),
		TotalCategories: len(categories),
		LastUpdate:      lastUpdate,
		RecentPosts:     recent,
	}

	writeJSON(w, http.StatusOK, stats)
}
