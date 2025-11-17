# استخدم Node.js خفيف
FROM node:20-alpine

# عين مجلد العمل
WORKDIR /app

# انسخ ملفات package
COPY package*.json ./

# نصّب dependencies
RUN npm install

# انسخ باقي المشروع
COPY . .

# بناء المشروع
RUN npm run build

# فتح البورت 3000
EXPOSE 3000

# أمر التشغيل
CMD ["npm", "start"]
