# Notion Blog Backend

Backend API cho blog sử dụng Notion làm CMS.

## Tính năng

- Kết nối với Notion API để lấy dữ liệu từ workspace
- Endpoints RESTful API để lấy bài viết, tác giả, danh mục, cài đặt
- Hệ thống cache để tối ưu hiệu suất và giảm số lượng API calls đến Notion
- Bảo mật với helmet, rate limiting và CORS
- Logs với morgan

## Cài đặt

```bash
# Clone repo
git clone https://github.com/slogvo/blog-express.git
cd blog-express

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env
# Sau đó cập nhật các giá trị trong file .env

# Chạy development server
npm run dev
```

## Cấu hình Notion

1. Tạo một Notion integration tại https://www.notion.so/my-integrations
2. Lấy Notion API key và thêm vào file .env
3. Tạo các databases sau trong Notion:
   - Posts database
   - Authors database
   - Categories database
   - Settings database
4. Chia sẻ các databases với integration bạn vừa tạo
5. Lấy ID của từng database và thêm vào file .env

## API Endpoints

### Posts

- `GET /api/posts` - Lấy danh sách bài viết với phân trang và lọc
- `GET /api/posts/:id` - Lấy chi tiết bài viết theo ID

### Authors

- `GET /api/authors` - Lấy danh sách tác giả
- `GET /api/authors/:id` - Lấy chi tiết tác giả theo ID

### Categories

- `GET /api/categories` - Lấy danh sách danh mục

### Settings

- `GET /api/settings` - Lấy cài đặt website

## Triển khai

Backend này có thể được triển khai trên các nền tảng như:

- Vercel
- Netlify Functions
- Heroku
- AWS Lambda
- DigitalOcean App Platform

## Cấu trúc thư mục

```
.
├── src/
│   ├── config/         # Cấu hình (Notion, cache, etc.)
│   ├── controllers/    # Xử lý logic
│   ├── middleware/     # Middleware Express
│   ├── routes/         # Định nghĩa routes
│   ├── utils/          # Tiện ích
│   └── index.js        # Entry point
├── .env.example        # Mẫu file env
├── package.json
└── README.md
```
