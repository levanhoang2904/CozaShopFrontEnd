import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { HeaderService } from '../../Services/header/header-service.service';
import { PostService } from '../../Services/post/post.service';
import { CateogryService } from '../../Services/category/cateogry.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent implements OnInit, OnDestroy {
  constructor(
    private title: Title,
    private router: Router,
    private httpServer: HttpServerService,
    private headerService: HeaderService
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  blogs: PostService[] = [];
  pageCount: number[] = [];
  pageCurrent = 1;
  categories: CateogryService[] = [];
  queryString: string = '';
  @Input() searchModel: string | undefined;
  categorySelect: string = '';
  isSearch: boolean = false;

  ngOnInit(): void {
    this.title.setTitle('Tin tức');
    window.scrollTo(0, 0);
    this.headerService.updateData(false);

    this.getStoredQuery();
    this.queryString = this.updateQueryString();
    this.getAllPost(this.queryString);
    const getCategorySub = this.httpServer.getCategories().subscribe((data) => {
      this.categories = data;
    });
    this.subscriptions.add(getCategorySub)
  }

  saveQuery(query: string): void {
    sessionStorage.setItem('queryBlog', query);
  }

  getQuery(): string | null {
    return sessionStorage.getItem('queryBlog');
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
      queryOptions.length > 0
        ? `?limit=6&${queryOptions.join('&')}`
        : '?limit=6';

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

  setCategory(id: string) {
    this.categorySelect = id;
    this.changeCategory();
  }

  getAllPost(query: string) {
    const getAllPostAdminSub = this.httpServer.getAllPostAdmin(query).subscribe((data) => {
      this.blogs = data.posts;
      if (this.pageCount.length === 0)
        for (let i = 1; i <= data.pageCount; i++) this.pageCount.push(i);
    });
    this.subscriptions.add(getAllPostAdminSub)
  }

  setPageCurrent(page: number = 1) {
    this.pageCurrent = page;
    this.queryString = this.updateQueryString();
    this.getAllPost(this.queryString);
  }
}
