import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../Components/admin/header/header.component';
import { NavbarComponent } from '../../../Components/admin/navbar/navbar.component';
import { ChatbotService } from '../../../Services/chatbot/chatbot.service';

@Component({
  selector: 'app-page-admin',
  standalone: true,
  imports: [RouterModule, HeaderComponent, NavbarComponent],
  templateUrl: './page-admin.component.html',
  styleUrl: './page-admin.component.css',
})
export class PageAdminComponent implements OnInit, OnDestroy {
  constructor(private chatbotService: ChatbotService) {}
  navbarAcitve: boolean = false;
  setActive(value: any) {
    this.navbarAcitve = value;
  }

  ngOnInit() {
    this.hideChatbot();
  }

  ngOnDestroy(): void {
    this.showChatbot();
  }

  showChatbot(): void {
    const kommunicateWidget = document.getElementById(
      'kommunicate-widget-iframe'
    );
    if (kommunicateWidget) {
      kommunicateWidget.style.display = 'block';
    }
  }

  hideChatbot(): void {
    const kommunicateWidget = document.getElementById(
      'kommunicate-widget-iframe'
    );
    if (kommunicateWidget) {
      kommunicateWidget.style.display = 'none';
    }
  }
}
