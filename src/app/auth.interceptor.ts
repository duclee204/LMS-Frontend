import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  // ✅ Không thêm token nếu đang gọi login hoặc register
  if (req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }

  // ✅ Gắn token nếu có
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    console.log('✅ Interceptor chạy, token:', token);

    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next(authReq);
    }
  }

  return next(req);
};
