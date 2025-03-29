# 1단계: 빌드
FROM node:18-alpine AS build
WORKDIR /app

# 패키지 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 2단계: nginx로 배포
FROM nginx:alpine

# Nginx 설정 복사
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Vite 빌드 결과 복사 (dist 폴더로 수정)
COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]