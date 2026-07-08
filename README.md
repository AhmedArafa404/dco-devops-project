# DCO Sample App

تطبيق Node.js/Express بسيط يُستخدم كـ "subject application" لمشروع
DevOps-Enabled Cloud Resource Optimizer (DCO).

## Endpoints
- `GET /` — معلومات عن الـ instance الحالي (hostname, uptime, وقت التشغيل)
- `GET /health` — health check endpoint (يُستخدم في CI/CD والمراقبة)

## التشغيل محليًا (بدون Docker)
```bash
npm install
npm start
# افتح http://localhost:3000
```

## تشغيل الاختبارات
```bash
npm test
```

## البناء والتشغيل عبر Docker
```bash
docker build -t dco-app:latest .
docker run -d -p 3000:3000 --name dco-app dco-app:latest

# تأكد إنه شغال
curl http://localhost:3000/health

# قياس حجم الـ image (مهم للـ benchmarks)
docker images dco-app:latest

# إيقاف وحذف
docker stop dco-app && docker rm dco-app
```

## الخطوة الجاية
1. رفع المشروع ده على GitHub repo
2. بناء GitHub Actions workflow (CI: test + build + push للـ registry)
3. عمل EC2 instance ونشر الـ image عليه تلقائيًا (CD)
