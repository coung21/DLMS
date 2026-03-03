FROM node:22-alpine

WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn frontend
COPY . .

# Port mặc định của Vite
EXPOSE 5173

# Chạy Vite dev server (thêm --host để expose ra mạng Docker)
CMD ["npm", "run", "dev", "--", "--host"]
