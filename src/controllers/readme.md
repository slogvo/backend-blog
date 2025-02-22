populate là một tính năng của Mongoose – một thư viện ORM (Object-Relational Mapping) được xây dựng trên MongoDB để làm việc với Node.js.

## Populate là gì?

`populate` là một phương thức của Mongoose, giúp "điền" (populate) dữ liệu từ các collection khác vào document hiện tại dựa trên các trường tham chiếu (ref).
MongoDB thuần túy (native MongoDB) không có khái niệm populate. Trong MongoDB, nếu bạn muốn liên kết dữ liệu giữa các collection, bạn phải thực hiện nhiều truy vấn thủ công hoặc dùng $lookup (từ phiên bản 3.2 trở lên).
