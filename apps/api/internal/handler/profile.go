package handler

import (
	"encoding/json"
	"net/http"
)

// 导出为公开函数
func WriteJSON(w http.ResponseWriter, code int, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v)
}

func WriteError(w http.ResponseWriter, code int, msg string) {
	WriteJSON(w, code, map[string]string{"error": msg})
}

// 保留小写版本用于内部
func writeJSON(w http.ResponseWriter, code int, v interface{}) {
	WriteJSON(w, code, v)
}

func writeError(w http.ResponseWriter, code int, msg string) {
	WriteError(w, code, msg)
}
