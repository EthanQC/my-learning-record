package model

import "time"

// Post 完整文章
type Post struct {
	Slug      string    `json:"slug" example:"blog/murmurs-and-reflection/2025.5.7"`
	Title     string    `json:"title" example:"碎碎念"`
	Category  string    `json:"category" example:"murmurs-and-reflection"`
	Tags      []string  `json:"tags" example:"碎碎念,日常"`
	Summary   string    `json:"summary" example:"今天学习了..."`
	Content   string    `json:"content" example:"## 标题\n内容..."`
	Date      time.Time `json:"date" example:"2025-05-07T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2025-05-08T10:30:00Z"`
}

// PostMeta 文章元信息
type PostMeta struct {
	Slug     string    `json:"slug" example:"blog/murmurs-and-reflection/2025.5.7"`
	Title    string    `json:"title" example:"碎碎念"`
	Category string    `json:"category" example:"murmurs-and-reflection"`
	Tags     []string  `json:"tags" example:"碎碎念,日常"`
	Summary  string    `json:"summary" example:"今天学习了..."`
	Date     time.Time `json:"date" example:"2025-05-07T00:00:00Z"`
}

// Category 分类信息
type Category struct {
	Name  string `json:"name" example:"murmurs-and-reflection"`
	Label string `json:"label" example:"碎碎念"`
	Count int    `json:"count" example:"42"`
}

// Stats 网站统计
type Stats struct {
	TotalPosts      int        `json:"total_posts" example:"128"`
	TotalCategories int        `json:"total_categories" example:"5"`
	LastUpdate      time.Time  `json:"last_update" example:"2025-05-07T00:00:00Z"`
	RecentPosts     []PostMeta `json:"recent_posts"`
}
