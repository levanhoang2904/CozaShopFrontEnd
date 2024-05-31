import { UploadAdapter } from '@ckeditor/ckeditor5-upload';

export class Base64UploadAdapter implements UploadAdapter {
  constructor(private loader: any) {}

  upload(): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function () {
        resolve({ default: reader.result });
      };

      reader.onerror = function (error) {
        reject(error);
      };

      reader.onabort = function () {
        reject();
      };

      this.loader.file.then(
        (file: any) =>
          new Promise((resolve, reject) => {
            reader.readAsDataURL(file);
          })
      );
    });
  }
}
