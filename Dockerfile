# 1. 빌드 스테이지
FROM node:18-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 애플리케이션 코드 복사 및 빌드
COPY . .
RUN npm run build

# 2. 배포 스테이지
FROM nginx:alpine

# Nginx 설정 파일 (필요 시 커스터마이징 가능)
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx를 포어그라운드에서 실행
CMD ["nginx", "-g", "daemon off;"]