package model

import "time"

// Contact 留言记录
type Contact struct {
	ID        int64     `json:"id" example:"1"`
	Name      string    `json:"name" example:"张三"`
	Email     string    `json:"email" example:"zhangsan@example.com"`
	Message   string    `json:"message" example:"你好,我想问..."`
	CreatedAt time.Time `json:"created_at" example:"2025-05-07T10:30:00Z"`
}

// ContactInput 提交留言的输入
type ContactInput struct {
	Name     string `json:"name" validate:"required,min=1,max=100" example:"张三"`
	Email    string `json:"email" validate:"required,email,max=200" example:"zhangsan@example.com"`
	Message  string `json:"message" validate:"required,min=1" example:"你好,我想问..."`
	Honeypot string `json:"_honey,omitempty" swaggerignore:"true"` // 蜜罐字段,不显示在文档
}
