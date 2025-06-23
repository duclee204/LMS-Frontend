import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { routes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
// Đoạn code này là phần cấu hình module chính của ứng dụng Angular, bao gồm các thành phần cần thiết để khởi tạo ứng dụng.
// Nó định nghĩa các thành phần (components) sẽ được sử dụng trong ứng dụng, các module cần thiết và các dịch vụ (providers) nếu có.