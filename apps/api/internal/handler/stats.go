package handler

import (
	"net/http"
	"sort"
	"time"

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

	// 分类数（忽略错误也可；如需严格可以加判错）
	categories, _ := h.mdService.GetCategories()

	// 倒序：新→旧
	sort.Slice(posts, func(i, j int) bool {
		return posts[i].Date.After(posts[j].Date)
	})

	// 最近 5 篇；且保证空数组返回 []
	var recent []model.PostMeta
	switch n := len(posts); {
	case n == 0:
		recent = []model.PostMeta{}
	case n <= 5:
		recent = append([]model.PostMeta(nil), posts...) // 拷贝一份，避免共享底层数组
	default:
		recent = append([]model.PostMeta(nil), posts[:5]...)
	}

	// 最近更新时间：有文章取首篇时间；无文章给零值或当前时间均可
	// 如果 model.Stats.LastUpdate 是 time.Time，零值会序列化成 "0001-01-01T00:00:00Z"
	// 你也可以用 time.Now() 代替，看产品需求。
	var lastUpdate time.Time
	if len(posts) > 0 {
		lastUpdate = posts[0].Date
	} else {
		// lastUpdate = time.Time{} // 零值；或：
		lastUpdate = time.Now().UTC()
	}

	// categories 只取数量；为空也能正常统计
	totalCategories := 0
	if categories != nil {
		totalCategories = len(categories)
	}

	stats := model.Stats{
		TotalPosts:      len(posts),
		TotalCategories: totalCategories,
		LastUpdate:      lastUpdate,
		RecentPosts:     recent,
	}

	writeJSON(w, http.StatusOK, stats)
}
