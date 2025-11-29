package service

import (
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/EthanQC/my-learning-record/apps/api/internal/model"
	"gopkg.in/yaml.v3"
)

type PostService struct {
	contentDir string
}

func NewPostService(contentDir string) *PostService {
	return &PostService{contentDir: contentDir}
}

// 列出所有文章(同时包含 blog 和 notes)
func (s *PostService) ListPosts() ([]model.PostMeta, error) {
	var posts []model.PostMeta

	for _, subDir := range []string{"blog", "notes"} {
		dir := filepath.Join(s.contentDir, subDir)
		if !fileExists(dir) {
			continue
		}

		err := filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
			if err != nil || d.IsDir() || !strings.HasSuffix(path, ".md") {
				return err
			}

			meta, err := s.parsePostMeta(path)
			if err != nil {
				return nil
			}
			posts = append(posts, *meta)
			return nil
		})

		if err != nil {
			return nil, err
		}
	}

	return posts, nil
}

// 获取单篇文章
func (s *PostService) GetPost(slug string) (*model.Post, error) {
	// slug 格式: blog/murmurs-and-reflection/2025.5.7
	//         或: notes/cpp/STL/vector

	log.Printf("[DEBUG] GetPost 收到 slug: %s", slug)

	// 直接拼接完整路径
	filePath := filepath.Join(s.contentDir, slug+".md")

	log.Printf("[DEBUG] 尝试读取文件: %s", filePath)

	if !fileExists(filePath) {
		log.Printf("[DEBUG] 文件不存在: %s", filePath)
		return nil, os.ErrNotExist
	}

	content, err := os.ReadFile(filePath)
	if err != nil {
		log.Printf("[ERROR] 读取文件失败: %v", err)
		return nil, err
	}

	post, err := s.parsePost(filePath, content)
	if err != nil {
		log.Printf("[ERROR] 解析文章失败: %v", err)
		return nil, err
	}

	return post, nil
}

// 解析文章元信息
func (s *PostService) parsePostMeta(path string) (*model.PostMeta, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	fm := extractFrontmatter(string(content))

	// 计算 slug (相对于 content 目录)
	rel, _ := filepath.Rel(s.contentDir, path)
	slug := filepath.ToSlash(strings.TrimSuffix(rel, ".md"))

	// 解析分类(从 slug 第二级开始)
	parts := strings.Split(slug, "/")
	category := ""
	if len(parts) >= 2 {
		category = parts[1]
	}

	stat, _ := os.Stat(path)

	return &model.PostMeta{
		Slug:     slug,
		Title:    getStringField(fm, "title", filepath.Base(path)),
		Category: category,
		Tags:     getTagsField(fm),
		Summary:  getStringField(fm, "summary", ""),
		Date:     getDateField(fm, "date", stat.ModTime()),
	}, nil
}

// 解析完整文章
func (s *PostService) parsePost(path string, content []byte) (*model.Post, error) {
	text := string(content)
	fm := extractFrontmatter(text)

	// 移除 frontmatter 得到正文
	body := text
	if idx := strings.Index(text, "---"); idx >= 0 {
		if idx2 := strings.Index(text[idx+3:], "---"); idx2 >= 0 {
			body = strings.TrimSpace(text[idx+idx2+6:])
		}
	}

	// 计算 slug
	rel, _ := filepath.Rel(s.contentDir, path)
	slug := filepath.ToSlash(strings.TrimSuffix(rel, ".md"))

	parts := strings.Split(slug, "/")
	category := ""
	if len(parts) >= 2 {
		category = parts[1]
	}

	stat, _ := os.Stat(path)

	return &model.Post{
		Slug:      slug,
		Title:     getStringField(fm, "title", filepath.Base(path)),
		Category:  category,
		Tags:      getTagsField(fm),
		Summary:   getStringField(fm, "summary", ""),
		Content:   body,
		Date:      getDateField(fm, "date", stat.ModTime()),
		UpdatedAt: stat.ModTime(),
	}, nil
}

// 获取分类列表
func (s *PostService) GetCategories() ([]model.Category, error) {
	posts, err := s.ListPosts()
	if err != nil {
		return nil, err
	}

	countMap := make(map[string]int)
	for _, p := range posts {
		if p.Category != "" {
			countMap[p.Category]++
		}
	}

	labelMap := map[string]string{
		"murmurs-and-reflection":       "碎碎念",
		"interview-experiences":        "面经",
		"internship-records":           "实习记录",
		"join-in-open-source":          "开源",
		"cpp":                          "C++",
		"go":                           "Go",
		"data-structure-and-algorithm": "算法",
		"interview-questions":          "八股",
	}

	var categories []model.Category
	for name, count := range countMap {
		label := labelMap[name]
		if label == "" {
			label = name
		}
		categories = append(categories, model.Category{
			Name:  name,
			Label: label,
			Count: count,
		})
	}

	return categories, nil
}

// 工具函数
func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func extractFrontmatter(content string) map[string]interface{} {
	if !strings.HasPrefix(content, "---") {
		return nil
	}

	end := strings.Index(content[3:], "---")
	if end < 0 {
		return nil
	}

	var fm map[string]interface{}
	yaml.Unmarshal([]byte(content[3:3+end]), &fm)
	return fm
}

func getStringField(fm map[string]interface{}, key, fallback string) string {
	if fm == nil {
		return fallback
	}
	if v, ok := fm[key].(string); ok {
		return v
	}
	return fallback
}

func getTagsField(fm map[string]interface{}) []string {
	if fm == nil {
		return []string{}
	}

	// 支持 YAML 被解析成 []interface{} 或 []string，兜底空切片而不是 nil
	if raw, ok := fm["tags"]; ok {
		switch v := raw.(type) {
		case []interface{}:
			tags := make([]string, 0, len(v))
			for _, t := range v {
				if str, ok := t.(string); ok {
					tags = append(tags, str)
				}
			}
			return tags
		case []string:
			return append([]string{}, v...)
		case string:
			return []string{v}
		}
	}

	return []string{}
}

func getDateField(fm map[string]interface{}, key string, fallback time.Time) time.Time {
	if fm == nil {
		return fallback
	}
	if v, ok := fm[key].(string); ok {
		formats := []string{
			"2006-01-02",
			"2006.01.02",
			"2006/01/02",
			time.RFC3339,
		}
		for _, format := range formats {
			if t, err := time.Parse(format, strings.TrimSpace(v)); err == nil {
				return t
			}
		}
	}
	return fallback
}
