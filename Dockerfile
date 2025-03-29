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

# EC2의 Nginx 설정 경로와 동일하게 설정
COPY /home/ec2-user/infra/nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]