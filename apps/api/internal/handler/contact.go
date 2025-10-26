package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/EthanQC/my-learning-record/apps/api/internal/model"
	"github.com/EthanQC/my-learning-record/apps/api/internal/service"
	"github.com/go-playground/validator/v10"
)

type ContactHandler struct {
	service  *service.ContactService
	validate *validator.Validate
}

func NewContactHandler(svc *service.ContactService) *ContactHandler {
	return &ContactHandler{
		service:  svc,
		validate: validator.New(validator.WithRequiredStructEnabled()),
	}
}

// Create 创建留言
// @Summary      提交留言
// @Description  用户提交联系留言
// @Tags         留言管理
// @Accept       json
// @Produce      json
// @Param        body  body      model.ContactInput  true  "留言内容"
// @Success      201   {object}  model.Contact  "创建成功"
// @Failure      400   {object}  map[string]string  "参数错误"
// @Failure      500   {object}  map[string]string  "服务器错误"
// @Router       /contact [post]
func (h *ContactHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input model.ContactInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}

	if strings.TrimSpace(input.Honeypot) != "" {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
		return
	}

	if err := h.validate.Struct(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	contact, err := h.service.Create(&input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "create failed")
		return
	}

	writeJSON(w, http.StatusCreated, contact)
}

// List 获取留言列表
// @Summary      查看留言列表
// @Description  管理员查看所有留言(需要 Token)
// @Tags         留言管理
// @Accept       json
// @Produce      json
// @Param        X-Admin-Token  header    string  true  "管理员 Token"
// @Success      200            {array}   model.Contact  "留言列表"
// @Failure      401            {object}  map[string]string  "未授权"
// @Failure      500            {object}  map[string]string  "服务器错误"
// @Router       /contact [get]
// @Security     AdminAuth
func (h *ContactHandler) List(w http.ResponseWriter, r *http.Request) {
	contacts, err := h.service.List(200)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "query failed")
		return
	}
	writeJSON(w, http.StatusOK, contacts)
}
