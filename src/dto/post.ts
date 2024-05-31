export class CreatePostDTO {
  title: string = '';
  category: string = '';
  description: string = '';
}

export class UpdatePostDTO {
  title?: string;
  category?: string;
  description?: string;
  status?: number;
}
