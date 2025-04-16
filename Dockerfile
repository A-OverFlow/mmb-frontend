# 1단계: 빌드
FROM node:18-alpine AS build
WORKDIR /app

# 빌드 인자 (환경 종류: dev, staging, production 등)
ARG VITE_ENV=dev
ENV VITE_ENV=${VITE_ENV}

COPY package*.json ./
RUN npm install

COPY . .

# 환경 설정 파일 복사: .env.{VITE_ENV} → .env 로 치환
RUN cp .env.${VITE_ENV} .env

RUN npm run build

# 2단계: nginx로 배포
FROM nginx:alpine

# Nginx 기본 경로 생성
RUN mkdir -p /usr/share/nginx/html

# 빌드 결과 복사
COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]