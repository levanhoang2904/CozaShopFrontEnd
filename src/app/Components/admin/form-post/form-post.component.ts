import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { Title } from '@angular/platform-browser';
import { CateogryService } from '../../../Services/category/cateogry.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { PostService } from '../../../Services/post/post.service';
import { MyUploadAdapter } from '../../../helpers/upload-adapter';
import { Base64UploadAdapter } from '../../../helpers/upload-adapter-base64';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-post',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, CKEditorModule],
  templateUrl: './form-post.component.html',
  styleUrl: './form-post.component.css',
})
export class FormPostComponent implements OnInit, OnDestroy {
  constructor(
    private httpServer: HttpServerService,
    private title: Title,
    private router: ActivatedRoute,
    private navigateRouter: Router
  ) {}

  public Editor = ClassicEditor;
  toaster = inject(ToastrService);
  categories: CateogryService[] = [];
  post!: PostService;
  isFormSubmitted: boolean = false;

  formSubmit: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });

  private file?: File;
  img: string = '';
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  onReady(editor: ClassicEditor): void {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader);
    };
  }

  ngOnInit(): void {
    const getCategoriesSub = this.httpServer.getCategories().subscribe((data) => {
      this.categories = data;
    });
    this.subscriptions.add(getCategoriesSub)

    const queryParamsSub =  this.router.queryParams.subscribe((data) => {
      if (data['id']) {
        this.title.setTitle('Chỉnh sửa bài viết');
        this.httpServer.getDetailPost(data['id']).subscribe((data) => {
          this.post = data;

          this.formSubmit.patchValue({
            title: this.post.title,
            category: this.post.category._id,
            description: this.post.description,
          });
        });
      } else {
        this.title.setTitle('Tạo mới bài viết');
      }
    });
    this.subscriptions.add(queryParamsSub)
  }

  clearQuery(): void {
    sessionStorage.removeItem('query');
  }

  onChangeImg(event: any) {
    this.file = event.target.files[0];
    this.img = window.URL.createObjectURL(event.target.files[0]);
  }

  onSubmit() {
    this.clearQuery();
    this.isFormSubmitted = true;
    if (this.formSubmit.valid) {
      const postData = {
        title: this.formSubmit.value.title,
        category: this.formSubmit.value.category,
        description: this.formSubmit.value.description,
      };

      if (!this.post) {
        const createPostSub =  this.httpServer.createPost(postData, this.file).subscribe({
          next: (data) => {
            if (data.statusCode === 200) {
              this.toaster.success('Tạo mới bài viết thành công', 'Thành công');
              this.navigateRouter.navigateByUrl('/admin/post');
            }
          },
          error: (error) => {
            console.log(error);
            this.toaster.error(error.error.message, 'Lỗi');
          },
        });
        this.subscriptions.add(createPostSub)
      } else {
        const updatePostSub = this.httpServer
          .updatePost(this.post._id, postData, this.file)
          .subscribe({
            next: (data) => {
              if (data.statusCode === 200) {
                this.toaster.success(
                  'Chỉnh sửa bài viết thành công',
                  'Thành công'
                );
                this.navigateRouter.navigateByUrl('/admin/post');
              }
            },
            error: (error) => {
              this.toaster.error(error.error.message, 'Lỗi');
            },
          });
          this.subscriptions.add(updatePostSub)
      }
    }
  }
}
