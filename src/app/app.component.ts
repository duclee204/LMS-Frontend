import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router'; // ✅ Import thêm RouterModule
import { TitleService } from './services/title.service';

@Component({
  selector: 'app-root',
  standalone: true, // 👈 nếu bạn đang dùng standalone
  imports: [RouterOutlet, RouterModule], // ✅ Bổ sung RouterModule tại đây
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
  constructor(private titleService: TitleService) {}
}
