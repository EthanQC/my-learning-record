package service

import (
	"database/sql"

	"github.com/EthanQC/my-learning-record/apps/api/internal/model"
)

type ContactService struct {
	db *sql.DB
}

func NewContactService(db *sql.DB) *ContactService {
	return &ContactService{db: db}
}

func (s *ContactService) Create(input *model.ContactInput) (*model.Contact, error) {
	res, err := s.db.Exec(
		`INSERT INTO contacts(name,email,message,created_at) VALUES (?,?,?,NOW())`,
		input.Name, input.Email, input.Message,
	)
	if err != nil {
		return nil, err
	}

	id, _ := res.LastInsertId()
	var contact model.Contact
	err = s.db.QueryRow(
		`SELECT id,name,email,message,created_at FROM contacts WHERE id=?`, id,
	).Scan(&contact.ID, &contact.Name, &contact.Email, &contact.Message, &contact.CreatedAt)

	return &contact, err
}

func (s *ContactService) List(limit int) ([]model.Contact, error) {
	rows, err := s.db.Query(
		`SELECT id,name,email,message,created_at FROM contacts ORDER BY created_at DESC LIMIT ?`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Contact
	for rows.Next() {
		var c model.Contact
		if err := rows.Scan(&c.ID, &c.Name, &c.Email, &c.Message, &c.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}
