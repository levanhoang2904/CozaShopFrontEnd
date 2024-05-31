import { Component, Input, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderService as ServiceHeader } from '../../../Services/header/header-service.service';
import { CartService } from '../../../Services/cart/cart.service';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  @Input() isActive: boolean = false;
  ngOnInit(): void {}

  constructor(
    private sharedDataService: SharedDataService,
    private cartService: CartService,
    private headerService: ServiceHeader,
    private router: Router
  ) {}

  logout() {
    this.sharedDataService.accessToken = '';
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.cartService.initItems();
    this.headerService.updateLoginStatus(false);
    this.router.navigateByUrl('/login');
  }
}
