# Cập nhật API Frontend cho LMS - PHIÊN BẢN 2

## Tóm tắt thay đổi mới

✅ **HOÀN THÀNH**: Đã cập nhật courseId từ hardcode thành dynamic theo người dùng

## Các thay đổi chính trong phiên bản 2

### 1. API Service - Đã thêm
- **Method mới**: `getCoursesByUser()` - lấy danh sách courses của user hiện tại
- **Endpoint**: `GET /api/courses/list` với authentication

### 2. Video Upload Component - Cập nhật major
**Thay đổi từ**:
```typescript
courseId = 1; // hardcode
```

**Thành**:
```typescript
courseId: number | null = null; // dynamic
courses: any[] = []; // dropdown options
```

**Tính năng mới**:
- ✅ Load danh sách courses khi component init
- ✅ Dropdown selection thay vì input manual
- ✅ Auto-select course đầu tiên nếu có
- ✅ Disable submit button khi chưa chọn course
- ✅ Loading states với text "Đang tải lên..."
- ✅ Better validation: check courseId không null

### 3. Learn Online Component - Cập nhật major
**Tính năng mới**:
- ✅ Dropdown chọn course ở đầu trang
- ✅ Load courses khi component init
- ✅ Auto-load videos khi chọn course
- ✅ Method `onCourseChange()` để reload videos
- ✅ Loading states với spinner icon

**HTML Updates**:
- Thêm course selection UI với styling inline
- Loading indicator khi đang tải courses
- Disable dropdown khi loading hoặc không có courses

## API Flow hiện tại

### 1. User Authentication Required
```
Headers: Authorization: Bearer {jwt_token}
```

### 2. Load Courses (Both Components)
```
GET /api/courses/list
→ Returns: Array of courses user có quyền truy cập
```

### 3. Video Upload Flow
```
1. User vào trang upload
2. Load courses của user (chỉ instructor có courses để upload)
3. User chọn course từ dropdown
4. Upload với courseId được chọn
```

### 4. Learn Online Flow
```
1. User vào trang classroom
2. Load courses của user (enrolled courses for student / teaching courses for instructor)
3. Auto-select course đầu tiên
4. Load videos của course đó
5. User có thể chuyển course → reload videos
```

## User Experience Improvements

### Video Upload
- **Trước**: User phải biết và nhập courseId manual
- **Sau**: User chọn từ dropdown courses của mình
- **Validation**: Không thể submit nếu chưa chọn course
- **Loading**: Button disable và text thay đổi khi đang upload

### Learn Online  
- **Trước**: Hardcode courseId = 1
- **Sau**: Dynamic course selection, user chọn course muốn xem
- **UX**: Auto-load course đầu tiên, dễ dàng switch course

## Security & Authorization

### Backend Logic (đã implement)
- **Admin**: Access tất cả courses
- **Instructor**: Chỉ courses mình dạy
- **Student**: Chỉ courses đã enroll

### Frontend Handling
- Load courses theo quyền của user
- Hiển thị appropriate error messages (401, 403)
- Graceful handling khi user không có courses

## Technical Details

### API Calls
```typescript
// Load user courses
this.apiService.getCoursesByUser().subscribe({...})

// Load videos by selected course
this.apiService.getVideosByCourse(this.courseId).subscribe({...})

// Upload with selected course
formData.append('courseId', this.courseId.toString())
this.apiService.uploadVideo(formData).subscribe({...})
```

### State Management
```typescript
// Both components now have:
courseId: number | null = null;  // Selected course
courses: any[] = [];             // Available courses
loading = false;                 // Loading state
```

## Lưu ý quan trọng

1. **Backend dependency**: Cần đảm bảo `GET /api/courses/list` hoạt động đúng
2. **Role-based**: Chỉ instructor mới có courses để upload video
3. **Auto-selection**: Tự động chọn course đầu tiên để UX tốt hơn
4. **Error handling**: Clear messages cho từng loại lỗi

## Testing Steps

1. **Login as Instructor**:
   - Vào upload page → should see dropdown with teaching courses
   - Chọn course → upload video → success
   - Vào classroom → should see dropdown, auto-select course, load videos

2. **Login as Student**:
   - Vào upload page → should see "no courses" or 403 error
   - Vào classroom → should see enrolled courses, can view videos

3. **No login**:
   - Both pages should show 401 errors and redirect to login

## Kết quả

✅ **CourseId đã được dynamic hoàn toàn**
✅ **User experience được cải thiện đáng kể** 
✅ **Security và authorization được maintain**
✅ **Error handling robust và user-friendly**
✅ **Code clean và maintainable**
