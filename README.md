# React + Laravel Blog App

Full-stack blog uygulaması. Laravel REST API backend ve React (TypeScript) SPA frontend ile geliştirilmiştir.

## Özellikler

- **Public:** Blog listesi (sıralama: en son, trend, tartışılan), kategori/etiket/yazar sayfaları, blog detay, yorumlar, arama
- **Auth:** Kayıt, giriş, şifremi unuttum (e-posta), profil
- **Yazar:** Yeni blog yazma, kendi yazılarını düzenleme/silme, beğeni ve bookmark
- **Admin:** Dashboard (istatistikler), yazılar/kategoriler/etiketler/kullanıcılar CRUD
- **API:** REST, tutarlı response yapısı (`success`, `data`, `meta`, `message`), FormRequest validasyon, API Resources
- **Cache & Queue:** Redis ile cache (kategori, etiket, yazar, blog, admin stats), queue (hoş geldin e-postası vb.), rate limiting
- **SEO:** React Helmet ile sayfa başına title, description, canonical, Open Graph, Twitter Card

## Teknolojiler

### Backend (`/backend`)

| Alan | Teknoloji |
|------|------------|
| Framework | Laravel 10 |
| PHP | ^8.1 |
| Auth | Laravel Sanctum (API token) |
| Yetki | Spatie Laravel Permission (rol/izin) |
| Cache / Queue / Session | Redis (opsiyonel) veya file/sync/file |
| Veritabanı | MySQL (utf8mb4) |
| Slug | cviebrock/eloquent-sluggable |
| Redis client | predis |

### Frontend (`/frontend`)

| Alan | Teknoloji |
|------|------------|
| UI | React 19, TypeScript |
| Build | Vite |
| Stil | Tailwind CSS 4, shadcn/ui (Radix), class-variance-authority |
| Router | React Router 7 |
| Form | Formik, React Hook Form, Zod/Yup |
| HTTP | Axios |
| State | Context API (Auth, Categories, Tags, Blogs, Users), Zustand (isteğe bağlı) |
| SEO | react-helmet-async |

## Proje yapısı

```
.
├── backend/          # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   ├── Support/   # CacheKey, Utf8Sanitizer
│   │   └── ...
│   ├── config/
│   ├── routes/api.php
│   └── ...
├── frontend/         # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
└── README.md
```

## Kurulum

### Gereksinimler

- PHP 8.1+, Composer
- Node.js 18+, npm/pnpm
- MySQL 8+
- (Opsiyonel) Redis

### Backend

```bash
cd backend
cp .env.example .env
# .env içinde DB_*, APP_KEY, MAIL_* vb. düzenle
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API varsayılan: `http://localhost:8000`

### Frontend

```bash
cd frontend
cp .env.example .env
# .env: VITE_API_URL=http://localhost:8000 (backend adresi)
npm install
npm run dev
```

Uygulama: `http://localhost:5173`

### Redis (opsiyonel)

Backend `.env`:

```env
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
```

Queue worker: `php artisan queue:work`

Detay: `backend/REDIS.md`

## Ortam değişkenleri (özet)

| Değişken | Açıklama |
|----------|----------|
| `APP_URL` | Backend kök URL |
| `FRONTEND_URL` | Frontend kök (CORS vb.) |
| `DB_*` | MySQL bağlantısı |
| `VITE_API_URL` | Frontend’in istek atacağı API kökü |

## Lisans

MIT
