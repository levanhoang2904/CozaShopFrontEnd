import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { Title } from '@angular/platform-browser';
import { CateogryService } from '../../../Services/category/cateogry.service';
import { PostService } from '../../../Services/post/post.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponent implements OnInit, OnDestroy {
  constructor(
    private httpServer: HttpServerService,
    private shareDataService: SharedDataService,
    private title: Title
  ) {}

  posts: PostService[] = [];
  pageCount: number[] = [];
  categories: CateogryService[] = [];
  pageCurrent = 1;
  idCurrentPost: string = '';
  toaster = inject(ToastrService);
  queryString: string = '';
  @Input() searchModel: string | undefined;
  categorySelect: string = '';
  isSearch: boolean = false;
  isActive: boolean = false;
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    const isActiveSub = this.shareDataService.isActive$.subscribe((isActive) => {
      this.isActive = isActive;
    });

    this.title.setTitle('Quản lý bài viết');
    this.getAllPost(this.getStoredQuery() || '');
    const getCategoiesSub = this.httpServer.getCategories().subscribe((data) => {
      this.categories = data;
    });
    this.subscriptions.add(isActiveSub)
    this.subscriptions.add(getCategoiesSub)
  }

  saveQuery(query: string): void {
    sessionStorage.setItem('queryBlogAdmin', query);
  }

  getQuery(): string | null {
    return sessionStorage.getItem('queryBlogAdmin');
  }

  getStoredQuery() {
    const storedQuery = this.getQuery();
    if (storedQuery) {
      const queryParams = storedQuery.substring(1).split('&');
      queryParams.forEach((param) => {
        const [key, value] = param.split('=');
        if (key === 'page') {
          this.pageCurrent = parseInt(value);
        } else if (key === 'search') {
          this.searchModel = decodeURIComponent(value);
          this.isSearch = true;
        } else if (key === 'category') {
          this.categorySelect = value;
        }
      });
    }

    return storedQuery;
  }

  updateQueryString(): string {
    let queryOptions: string[] = [];
    this.isSearch = false;

    if (this.pageCurrent) {
      queryOptions.push(`page=${this.pageCurrent}`);
    }

    if (this.searchModel) {
      this.isSearch = true;
      queryOptions.push(`search=${encodeURIComponent(this.searchModel)}`);
    }

    if (this.categorySelect) {
      queryOptions.push(`category=${this.categorySelect}`);
    }

    const queryString =
      queryOptions.length > 0 ? `?${queryOptions.join('&')}` : '';

    this.saveQuery(queryString);

    return queryString;
  }

  searchPost() {
    this.queryString = this.updateQueryString();
    this.getAllPost(this.queryString);
  }

  changeCategory() {
    this.queryString = this.updateQueryString();
    this.getAllPost(this.queryString);
  }

  getAllPost(query: string) {
    const getPostAdminSub = this.httpServer.getAllPostAdmin(query).subscribe((data) => {
      this.posts = data.posts;
      if (this.pageCount.length === 0)
        for (let i = 1; i <= data.pageCount; i++) this.pageCount.push(i);
    });
    this.subscriptions.add(getPostAdminSub)
  }

  setPageCurrent(page: number = 1) {
    this.pageCurrent = page;
    this.queryString = this.updateQueryString();
    this.getAllPost(this.queryString);
  }

  setCurrentIdPost(idPost: string) {
    this.idCurrentPost = idPost;
  }

  clearQuery(): void {
    sessionStorage.removeItem('query');
    sessionStorage.removeItem('queryBlog');
  }

  deletePost(): void {
    if (this.idCurrentPost !== '') {
      const deletePostSub = this.httpServer.deletePost(this.idCurrentPost).subscribe({
        next: (data) => {
          if (data.statusCode === 200) {
            this.getAllPost('');
            this.toaster.success('Xoá bài viết thành công', 'Thành công');
            this.clearQuery();
          }
        },
        error: (error) => {
          this.toaster.error(error.error.message, 'Lỗi');
        },
      });
      this.subscriptions.add(deletePostSub)
    }
  }
}
