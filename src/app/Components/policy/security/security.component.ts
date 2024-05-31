import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../../Services/header/header-service.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './security.component.html',
  styleUrl: './security.component.css'
})
export class SecurityComponent{
  constructor(
  private headerService: HeaderService
  ){
    this.headerService.updateData(true);
    window.scrollTo(0, 0);
  }
}
