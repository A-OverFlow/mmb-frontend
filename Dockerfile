# 1단계: 빌드
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2단계: nginx로 배포
FROM nginx:alpine

# Nginx 설정 복사 (GitHub 레포지토리 경로 기준)
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# 빌드된 정적 파일 복사
COPY --from=build /app/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]