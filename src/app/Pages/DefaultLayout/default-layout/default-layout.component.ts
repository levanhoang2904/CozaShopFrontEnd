import {
  Component,
  HostListener,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
} from '@angular/core';
import { HeaderComponent } from '../../../Components/header/header.component';
import { FooterComponent } from '../../../Components/footer/footer.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SharedDataService } from '../../../Components/shared-data-service/shared-data-service.component';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { HeaderService } from '../../../Services/header/header-service.service';
import { AuthService } from '../../../Services/auth/auth.service';
import { CartService } from '../../../Services/cart/cart.service';
import { ProfilePageComponent } from '../../../Components/profile-page/profile-page.component';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatbotService } from '../../../Services/chatbot/chatbot.service';
import { UserDto } from '../../../../dto/classDto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    RouterModule,
    ProfilePageComponent,
    CommonModule,
  ],
  templateUrl: './default-layout.component.html',
  styleUrl: './default-layout.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {
  bgHeader = false;
  private hasCalledApi = false;
  user: UserDto = {
    _id: '',
    name: '',
    email: '',
    password: '',
    oldPass: '',
    phone: '',
    date: '',
    role: '',
  };
  name = '';
  constructor(
    private title: Title,
    private sharedDataService: SharedDataService,
    private httpServerService: HttpServerService,
    private headerService: HeaderService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cartService: CartService,
    private chatbotService: ChatbotService
  ) {}
  private subscriptions: Subscription = new Subscription();
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  ngOnInit(): void {
    const routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (this.sharedDataService.accessToken && !this.hasCalledApi) {
          if (this.sharedDataService.accessToken) {
            try {
              const detailUser = this.httpServerService
                .getDetailUser(this.sharedDataService.accessToken)
                .subscribe({
                  next: (response) => {
                    this.user = response.data;
                    this.name = response.data.name;
                    this.headerService.updateLoginStatus(true);
                    if (this.authService.hasValue('accessToken')) {
                      this.cartService.initItems();
                    }
                  },
                  error: (error) => {
                    this.sharedDataService.accessToken = '';
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                  },
                });
              this.subscriptions.add(detailUser);
            } catch (error) {
              console.log(error);
            }
          }
        }
      });
    this.subscriptions.add(routerSub);
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.name = user.name;
    }

    this.chatbotService.initChatbot();
  }
  showScroll: boolean = false;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    this.showScroll = scrollTop > 20;
  }

  backToTop() {
    const scrollToTop = () => {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollTop > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, scrollTop - scrollTop / 4);
      }
    };
    scrollToTop();
  }
}
