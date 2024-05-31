import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-no-access',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './no-access.component.html',
  styleUrl: './no-access.component.css',
})
export class NoAccessComponent implements OnInit, OnDestroy {
  constructor(private shareDataService: SharedDataService) {}
  isActive: boolean = false;
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    const isActiveSub = this.shareDataService.isActive$.subscribe((isActive) => {
      this.isActive = isActive;
    });
    this.subscriptions.add(isActiveSub)
  }
}
