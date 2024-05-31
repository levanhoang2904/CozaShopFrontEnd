// import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnDestroy, OnInit, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { SharedDataService } from '../shared-data-service/shared-data-service.component';
import { FormsModule } from '@angular/forms';
import { HeaderService } from './header.service';
import { HeaderService as ServiceHeader } from '../../Services/header/header-service.service';
import { CartService } from '../../Services/cart/cart.service';
import { UserDto } from '../../../dto/classDto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers: [],
})
export class HeaderComponent implements OnInit, OnDestroy {
  constructor(
    private sharedDataService: SharedDataService,
    private httpServerService: HttpServerService,
    private router: Router, // private socialAuthService: SocialAuthService
    private serviceHeader: ServiceHeader,
    private searchService: HeaderService,
    private cartService: CartService,
    private headerService: ServiceHeader
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();

  public isPage: boolean = false;
  public isScrolled: boolean = false;
  public isShowSideBar: boolean = false;
  @Input() user : UserDto = {
    _id: undefined,
    name: '',
    email: '',
    password: '',
    oldPass: '',
    phone: '',
    date: '',
    role: ''
  }
  @Input() name: string = '';
  isShowSearch: boolean = false;
  // socialUser!: SocialUser;
  logged: boolean = false;
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (!this.isPage) this.isScrolled = window.scrollY > 2;
  }
  @Input() searchQuery: string = '';
  cartLength: string = '0';

  sendSearchQuery() {
    this.searchService.sendSearchQuery(this.searchQuery);
    this.router.navigateByUrl('/');
    this.searchQuery = '';
    this.isShowSearch = false;
  }

  showSideBar() {
    if (this.isShowSideBar === true) this.isShowSideBar = false;
    else this.isShowSideBar = true;
  }

  ngOnInit() {
    const userString = localStorage.getItem('user')
    if (userString) {
      this.user = JSON.parse(userString)
    }
    const dataSub = this.serviceHeader.getData().subscribe((data) => {
      if (data) {
        this.isPage = true;
        this.isScrolled = true;
      } else {
        this.isPage = false;
        this.isScrolled = false;
      }
    });
    this.subscriptions.add(dataSub)

    const cartUpdateSub = this.cartService.cartUpdated().subscribe(() => {
      this.updateCartLength();
    });
    this.subscriptions.add(cartUpdateSub)
  }

  updateCartLength(): void {
    this.cartLength =
      this.cartService.getCartLength() > 9
        ? '9+'
        : this.cartService.getCartLength().toString();
  }

  showSearch() {
    if (this.isShowSearch === true) this.isShowSearch = false;
    else this.isShowSearch = true;
  }

  isNameEmptyOrNull(): boolean {
    return !this.name || this.name.trim() === '';
  }

  logout() {
    this.sharedDataService.accessToken = '';
    localStorage.removeItem('accessToken');
    this.name = '';
    localStorage.removeItem('user');
    this.cartService.initItems();
    this.headerService.updateLoginStatus(false);
  }
}
