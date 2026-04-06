# Stage 1: Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Cài đặt dependencies (tận dụng layer cache)
COPY package*.json ./
RUN npm install

# Build mã nguồn
COPY . .
# Chạy build để tạo thư mục dist chứa các file tĩnh
RUN npm run build

# Stage 2: Serve stage với Nginx
FROM nginx:stable-alpine

# Copy thư mục dist đã được build ở stage trước vào thư mục tài liệu của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Cung cấp file cấu hình nginx riêng để hỗ trợ Single Page Application (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
