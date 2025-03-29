# 1단계: 빌드
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2단계: nginx로 배포
FROM nginx:alpine

# Nginx 기본 경로 생성
RUN mkdir -p /usr/share/nginx/html

# 빌드 결과 복사
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 설정 복사
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]