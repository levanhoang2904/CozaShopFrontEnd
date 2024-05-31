import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderService } from '../../Services/header/header-service.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { PostService } from '../../Services/post/post.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css',
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  constructor(
    private title: Title,
    private router: Router,
    private navigateRouter: Router,
    private activateRouter: ActivatedRoute,
    private headerService: HeaderService,
    private httpServer: HttpServerService
  ) {}

  blog!: PostService;
  textContent: any;
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    this.title.setTitle('Chi tiết bài viết');
    if (this.router.url.split('?')[0] === '/blog-detail') {
      this.headerService.updateData(true);
    }

    const activateRouterSub =  this.activateRouter.queryParams.subscribe((data) => {
      if (data['id']) {
        const getDetailPostSub = this.httpServer.getDetailPost(data['id']).subscribe((data) => {
          this.blog = data;
        });
        this.subscriptions.add(getDetailPostSub)
      }
    });
    this.subscriptions.add(activateRouterSub)
  }

  setCategoryQueryString(categoryId: string): void {
    sessionStorage.setItem('queryBlog', `?limit=6&category=${categoryId}`);
    this.navigateRouter.navigateByUrl('/blog');
  }
}
