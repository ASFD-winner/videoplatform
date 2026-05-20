# YADRO — Видеоплатформа

## Стек
- Бэкенд: Python 3.12, Django 4.2, Django REST Framework
- Авторизация: JWT
- База данных: SQLite
- Фронтенд: React 18, React Router v6, Axios

---

## Структура проекта
```
videoplatform/
├── backend/
│   ├── videoplatform/
│   ├── users/
│   ├── videos/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
└── docs/
```
---

## Запуск

**Бэкенд:**
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

**Фронтенд:**
```bash
cd frontend
npm start
```

- Фронтенд: http://localhost:3000  
- API: http://localhost:8000/api

---

## API

Защищённые эндпоинты требуют заголовок: `Authorization: Bearer <token>`

| Метод | URL | Описание |
|-------|-----|----------|
| POST | /api/auth/register/ | Регистрация |
| POST | /api/auth/login/ | Вход, возвращает JWT |
| POST | /api/auth/token/refresh/ | Обновить токен |
| GET/PATCH | /api/auth/profile/ | Профиль пользователя |
| GET | /api/videos/ | Список видео (поиск, фильтр) |
| POST | /api/videos/create/ | Загрузить видео |
| GET | /api/videos/{id}/ | Детали видео |
| DELETE | /api/videos/{id}/ | Удалить видео |
| POST | /api/videos/{id}/like/ | Лайк/дизлайк |
| GET/POST | /api/videos/{id}/comments/ | Комментарии |
| GET | /api/videos/categories/ | Список категорий |

**Пример — регистрация:**
```json
POST /api/auth/register/
{
  "username": "ivan",
  "email": "ivan@example.com",
  "password": "pass12345",
  "password2": "pass12345"
}
```