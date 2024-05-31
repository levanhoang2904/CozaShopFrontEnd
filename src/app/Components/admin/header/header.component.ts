import { RouterLink } from '@angular/router';
import { SharedDataService } from './../../shared-data-service/shared-data-service.component';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  constructor(private shareDataService: SharedDataService) {}
  public name: string = '';
  @Output() isActiveNavBar = new EventEmitter<boolean>(false);
  private isActving: boolean = false;
  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.name = user.name;
    }
  }

  setActiveNavBar() {
    if (this.isActving) {
      this.isActving = false;
      this.isActiveNavBar.emit(false);
      this.shareDataService.updateActive(false);

      return;
    }
    this.isActving = true;
    this.shareDataService.updateActive(true);
    this.isActiveNavBar.emit(true);
  }
}
