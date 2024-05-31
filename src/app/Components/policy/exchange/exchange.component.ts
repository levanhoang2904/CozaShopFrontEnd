import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderService } from '../../../Services/header/header-service.service';


@Component({
  selector: 'app-exchange',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './exchange.component.html',
  styleUrl: './exchange.component.css'
})
export class ExchangeComponent {
  constructor(
    private headerService: HeaderService
    ){
      this.headerService.updateData(true);
      window.scrollTo(0, 0);
    }
}
