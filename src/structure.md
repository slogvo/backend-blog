# Cấu trúc thư mục dự án Node.js

Cấu trúc thư mục trong `src/` tuân theo mô hình **MVC + Service Layer**, giúp tổ chức code rõ ràng và dễ bảo trì. Dưới đây là giải thích về từng thư mục và chức năng của chúng.

---

## 📁 @types/

- Chứa các định nghĩa TypeScript (`.d.ts`) để mở rộng hoặc bổ sung kiểu dữ liệu.
- Dùng để định nghĩa `interfaces`, `types`, hoặc mở rộng `Request` trong Express.

### 🔹 **Ví dụ: `@types/user.d.ts`**

```ts
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}
```

---

## 📁 config/

- Chứa các file cấu hình (database, environment variables, JWT, email, v.v.).
- Giúp tách biệt logic cấu hình khỏi code business logic.

### 🔹 **Ví dụ: `config/database.ts`**

```ts
import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("✅ Connected to MongoDB");
};
```

---

## 📁 controllers/

- Xử lý request từ client.
- Nhận request, gọi `services`, xử lý lỗi, và trả response.

### 🔹 **Ví dụ: `controllers/user.controller.ts`**

```ts
import { Request, Response } from "express";
import { getUsers } from "../services/user.service";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await getUsers();
  res.json(users);
};
```

---

## 📁 helpers/

- Chứa các hàm tiện ích (utility functions) dùng chung.

### 🔹 **Ví dụ: `helpers/hash.ts`**

```ts
import bcrypt from "bcryptjs";

export const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};
```

---

## 📁 middlewares/

- Chứa các middleware dùng cho Express (auth, logging, error handling, v.v.).

### 🔹 **Ví dụ: `middlewares/auth.middleware.ts`**

```ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
```

---

## 📁 models/

- Chứa các file định nghĩa Schema của MongoDB (Mongoose) hoặc ORM khác.

### 🔹 **Ví dụ: `models/user.model.ts`**

```ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

export const User = mongoose.model("User", UserSchema);
```

---

## 📁 routes/

- Chứa các file định nghĩa route cho API.

### 🔹 **Ví dụ: `routes/user.routes.ts`**

```ts
import express from "express";
import { getAllUsers } from "../controllers/user.controller";

const router = express.Router();

router.get("/users", getAllUsers);

export default router;
```

---

## 📁 services/

- Chứa logic nghiệp vụ (business logic) của ứng dụng.

### 🔹 **Ví dụ: `services/user.service.ts`**

```ts
import { User } from "../models/user.model";

export const getUsers = async () => {
  return await User.find();
};
```

---

## 📁 validators/

- Chứa các hàm kiểm tra dữ liệu đầu vào (validation).
- Dùng **Joi** hoặc **express-validator** để validate request body.

### 🔹 **Ví dụ: `validators/user.validator.ts`**

```ts
import Joi from "joi";

export const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
```

---

## 📄 server.ts

- File khởi động server Express.

### 🔹 **Ví dụ: `server.ts`**

```ts
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import userRoutes from "./routes/user.routes";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use("/api", userRoutes);

app.listen(5000, () => console.log("✅ Server running on port 5000"));
```

---
