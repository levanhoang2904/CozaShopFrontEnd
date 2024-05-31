import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderService } from '../../../Services/header/header-service.service';

@Component({
  selector: 'app-shopping-guide',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './shopping-guide.component.html',
  styleUrl: './shopping-guide.component.css'
})
export class ShoppingGuideComponent {
  constructor(
    private headerService: HeaderService
    ){
      this.headerService.updateData(true);
      window.scrollTo(0, 0);
    }
}
