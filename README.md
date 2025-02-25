# backend-blog

### 1. Nâng cao về Node.js Core

- **Event Loop**: Hiểu cách Node.js xử lý bất đồng bộ (async), vòng lặp sự kiện (event loop), và các giai đoạn như timers, I/O callbacks, poll, check...
  - Tài liệu: Xem video "The Node.js Event Loop" của Philip Roberts hoặc đọc docs Node.js.
- **Streams**: Học cách xử lý dữ liệu lớn (file upload, đọc file) bằng Streams thay vì Buffer toàn bộ.
  - Ví dụ: `fs.createReadStream` để đọc file lớn dần dần.
- **Modules**: Nắm rõ CommonJS (`require`) và ES Modules (`import`), khi nào dùng cái nào.

---

### 2. Xử lý bất đồng bộ (Async/Await, Promises)

- **Promise chaining**: Xử lý nhiều Promise liên tiếp.
- **Error handling**: Dùng `try/catch` hiệu quả, xử lý lỗi bất đồng bộ.
- **Async Patterns**: Callback hell → Promises → Async/Await.
- **Thực hành**: Viết API xử lý nhiều tác vụ bất đồng bộ (ví dụ: upload file, lưu DB, gửi email).

---

### 3. Authentication & Authorization

- **JWT (JSON Web Token)**: Thêm đăng nhập/đăng xuất vào dự án blog.

  - Cài `jsonwebtoken`, tạo token khi user đăng nhập, kiểm tra token trong middleware.
  - Ví dụ middleware:

    ```javascript
    const jwt = require("jsonwebtoken");

    const auth = (req, res, next) => {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ message: "No token" });
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({ message: "Invalid token" });
      }
    };
    ```

- **Role-based access**: Phân quyền (admin, user) trong `User` schema.

---

### 4. Database nâng cao

- **Mongoose nâng cao**:
  - **Indexes**: Tăng tốc truy vấn (ví dụ: thêm index cho `author` trong `Post`).
  - **Aggregation**: Dùng pipeline để tính toán, lọc phức tạp (tương tự `$lookup`).
  - **Transactions**: Đảm bảo dữ liệu nhất quán khi cập nhật nhiều document (ví dụ: tạo post và cập nhật user cùng lúc).
- **NoSQL Design**: Hiểu khi nào nhúng dữ liệu (embedding) thay vì tham chiếu (referencing) như `populate`.

---

### 5. API Design & RESTful Best Practices

- **RESTful conventions**:
  - GET, POST, PUT, DELETE đúng ngữ nghĩa.
  - Status code chuẩn (200, 201, 400, 404, 500).
- **Query optimization**: Hỗ trợ phân trang (`limit`, `skip`), sắp xếp (`sort`), lọc (`where`).
  - Ví dụ: `GET /api/posts?limit=10&skip=20&sort=-createdAt`.
- **HATEOAS** (nâng cao): Trả về link liên quan trong response.

---

### 6. Middleware & Error Handling

- **Custom Middleware**: Viết middleware kiểm tra dữ liệu, log request...
  - Ví dụ: Middleware validate input:
    ```javascript
    const validatePost = (req, res, next) => {
      const { title, content } = req.body;
      if (!title || !content)
        return res.status(400).json({ message: "Missing fields" });
      next();
    };
    ```
- **Global Error Handler**: Xử lý lỗi tập trung trong `app.js`.
  ```javascript
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  });
  ```

---

### 7. Performance & Optimization

- **Caching**: Dùng Redis hoặc in-memory cache để giảm tải database.
  - Ví dụ: Lưu danh sách `posts` trong Redis.
- **Rate Limiting**: Giới hạn request để tránh DDoS (dùng `express-rate-limit`).
- **Load Testing**: Dùng công cụ như `artillery` để kiểm tra API chịu tải bao nhiêu.

---

### 8. Testing

- **Unit Testing**: Dùng `Jest` hoặc `Mocha` để test controller, service.
  - Ví dụ test `getPosts`:
    ```javascript
    const { getPosts } = require("./postController");
    test("should return posts", async () => {
      const req = { query: {} };
      const res = { json: jest.fn() };
      await getPosts(req, res);
      expect(res.json).toHaveBeenCalled();
    });
    ```
- **Integration Testing**: Test toàn bộ API với database (dùng `supertest`).

---

### 9. Deployment & DevOps Basics

- **Docker**: Đóng gói ứng dụng thành container.
  - Ví dụ `Dockerfile`:
    ```dockerfile
    FROM node:18
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    CMD ["npm", "run", "dev"]
    ```
- **CI/CD**: Hiểu cách dùng GitHub Actions để tự động test/deploy.
- **Environment Variables**: Quản lý `.env` tốt hơn (dùng `dotenv` như bạn đã làm).

---

### 10. Làm việc với Frontend

- **CORS**: Xử lý cross-origin requests khi frontend gọi API.
  - Cài `cors`:
    ```bash
    npm install cors
    ```
    ```javascript
    const cors = require("cors");
    app.use(cors());
    ```
- **WebSocket**: Học Socket.IO để làm tính năng real-time (như thông báo bài viết mới).

---

### Tài liệu gợi ý

- **Node.js Docs**: [nodejs.org](https://nodejs.org/en/docs/)
- **Mongoose Docs**: [mongoosejs.com](https://mongoosejs.com/)
- **REST API Tutorial**: [restfulapi.net](https://restfulapi.net/)
- **JWT**: [jwt.io](https://jwt.io/)
- **Jest**: [jestjs.io](https://jestjs.io/)

---

### Kết quả mong đợi

Sau khi học những thứ trên, bạn sẽ:

- Viết API mạnh mẽ, bảo mật, dễ mở rộng.
- Hiểu sâu cách Node.js hoạt động.
- Làm việc tốt với team (frontend, DevOps).

Bạn muốn tập trung vào chủ đề nào trước? Ví dụ: mình có thể hướng dẫn chi tiết JWT hoặc unit testing ngay bây giờ! Cứ chọn nhé!
