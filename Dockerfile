# 1단계: 빌드
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2단계: nginx로 배포
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# 커스텀 Nginx 설정 복사
COPY ./nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]