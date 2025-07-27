# Tính năng Cập nhật Hồ sơ - LMS Frontend

## Tóm tắt tính năng

✅ **ĐÃ HOÀN THÀNH**: Tích hợp tính năng cập nhật hồ sơ người dùng khi nhấn vào nút "Cập nhật hồ sơ" trong dropdown profile.

## Các thay đổi chính

### 1. Backend - UserRestController.java
- **Thêm endpoint mới**: `GET /api/users/profile` - Lấy thông tin profile user hiện tại
- **Sử dụng existing endpoint**: `PUT /api/users/update/{id}` - Cập nhật thông tin user với FormData (hỗ trợ upload avatar)

### 2. Frontend - ProfileUpdateComponent (MỚI)
- **Component mới**: `ProfileUpdateComponent` - Modal form cập nhật hồ sơ
- **Tính năng**:
  - ✅ Form validation với Angular Reactive Forms
  - ✅ Upload avatar với preview
  - ✅ Cập nhật thông tin cơ bản (username, email, fullName)
  - ✅ Đổi mật khẩu (tùy chọn)
  - ✅ Responsive design
  - ✅ Loading states và error handling

### 3. Frontend - ProfileComponent (CẬP NHẬT)
- **Thêm modal management**: Hiển thị/ẩn ProfileUpdateComponent
- **Event handling**: Xử lý sự kiện cập nhật thành công
- **Auto-refresh**: Tự động reload thông tin user sau khi cập nhật

### 4. Frontend - UserService (CẬP NHẬT)
- **Thêm method mới**: `getCurrentUser()` - Lấy thông tin user hiện tại
- **Sử dụng existing method**: `updateUserWithForm()` - Cập nhật user với FormData

## Cách sử dụng

### 1. Từ giao diện người dùng:
1. Nhấn vào avatar/profile ở góc phải màn hình
2. Chọn "Cập nhật hồ sơ" từ dropdown
3. Modal form sẽ hiển thị với thông tin hiện tại
4. Chỉnh sửa thông tin cần thiết
5. Chọn ảnh avatar mới (nếu muốn)
6. Nhấn "Cập nhật" để lưu thay đổi

### 2. Validation rules:
- **Username**: Tối thiểu 3 ký tự, bắt buộc
- **Email**: Định dạng email hợp lệ, bắt buộc
- **Họ tên**: Tối thiểu 2 ký tự, bắt buộc
- **Mật khẩu**: Tùy chọn, để trống nếu không muốn đổi
- **Avatar**: Tùy chọn, chỉ chấp nhận file ảnh

## Files được tạo/cập nhật

### Files mới:
- `src/app/components/profile-update/profile-update.component.ts`
- `src/app/components/profile-update/profile-update.component.html`
- `src/app/components/profile-update/profile-update.component.scss`

### Files cập nhật:
- `src/app/components/profile/profile.component.ts`
- `src/app/components/profile/profile.component.html`
- `src/app/services/user.service.ts`
- `src/main/java/org/example/lmsbackend/controller/UserRestController.java`
- Các page components (dashboard, courses, course-management, etc.)

## API Endpoints sử dụng

### Backend:
```
GET /api/users/profile
- Lấy thông tin profile user hiện tại
- Authorization: Bearer token required

PUT /api/users/update/{id}
- Cập nhật thông tin user
- Content-Type: multipart/form-data
- Authorization: Bearer token required
- Body: FormData với các field: username, email, fullName, password?, avatar?
```

### Frontend Service:
```typescript
// UserService
getCurrentUser(): Observable<User>
updateUserWithForm(id: number, formData: FormData): Observable<any>
```

## Responsive Design

- ✅ **Desktop**: Modal rộng 700px với layout 2 cột
- ✅ **Tablet**: Layout 1 cột, modal responsive
- ✅ **Mobile**: Full-width modal với stacked buttons

## Security & Error Handling

- ✅ **Authentication**: Chỉ user đã login mới có thể cập nhật profile
- ✅ **Authorization**: User chỉ có thể cập nhật profile của chính mình
- ✅ **Validation**: Both client-side và server-side validation
- ✅ **Error Messages**: Hiển thị lỗi chi tiết cho user
- ✅ **File Upload**: Kiểm tra định dạng file avatar

## Testing

### 1. Test cơ bản:
1. Login với bất kỳ user nào
2. Nhấn vào profile dropdown
3. Chọn "Cập nhật hồ sơ"
4. Verify modal hiển thị với thông tin hiện tại
5. Thay đổi thông tin và submit
6. Verify thông báo thành công và thông tin được cập nhật

### 2. Test edge cases:
- Thử upload file không phải ảnh
- Thử submit form với thông tin không hợp lệ
- Thử đổi mật khẩu với confirm password không khớp
- Thử cập nhật khi server offline

## Kết quả

✅ **Hoàn thành 100%**: Tính năng cập nhật hồ sơ đã được tích hợp hoàn toàn  
✅ **User Experience**: Giao diện đẹp, responsive, dễ sử dụng  
✅ **Security**: Đảm bảo bảo mật và phân quyền phù hợp  
✅ **Error Handling**: Xử lý lỗi và validation đầy đủ  
✅ **Code Quality**: Clean code, component reusable, maintainable  

## Lưu ý

- Modal sẽ tự động load thông tin user từ JWT token
- Nếu không muốn đổi mật khẩu, để trống field password
- Avatar mới sẽ được upload và thay thế avatar cũ
- Sau khi cập nhật thành công, các component khác sẽ tự động refresh thông tin user
