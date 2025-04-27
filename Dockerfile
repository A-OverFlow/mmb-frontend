# 1단계: 빌드 환경
FROM node:20 AS builder

# 작업 디렉토리 생성
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# .env 파일은 이미 준비되었다고 가정
# 빌드 수행
RUN npm run build

# 2단계: 실행 환경 (Nginx)
FROM nginx:alpine

# 커스텀 Nginx 설정 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 빌드된 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 기본 포트 80 노출
EXPOSE 80 443

# Nginx 실행 (기본 엔트리포인트 사용)
CMD ["nginx", "-g", "daemon off;"]
