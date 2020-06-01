import BaseModel from "./base_model.ts";

export type Article = {
  author_id: number;
  body: string;
  created_at: number;
  description: string;
  id?: null|number;
  slug?: string;
  title: string;
  updated_at: number;
}

export class ArticleModel extends BaseModel {

  protected QUERY_CREATE_ARTICLE: string = "INSERT INTO articles (author_id, slug, title, description, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, to_timestamp(?), to_timestamp(?));"

  public author_id: number;
  public body: string;
  public created_at: number;
  public description: string;
  public id: null|number;
  public slug: string = "";
  public title: string;
  public updated_at: number;

  public async validate(
    data: { username: string; email: string; password: string },
  ): Promise<{ data: any }> {
    return {
      data: true
    };
  }

  constructor(
    authorId: number,
    title: string,
    description: string,
    body: string,
  ) {
    super();
    this.id = null;
    this.author_id = authorId;
    this.slug = this.createSlug(title);
    this.title = title;
    this.description = description;
    this.body = body;
    this.created_at = Date.now();
    this.updated_at = Date.now();
  }

  public async save(): Promise<string|void> {
    try {
      const query = this.prepare(this.QUERY_CREATE_ARTICLE, [
        String(this.author_id),
        this.slug,
        this.title,
        this.description,
        this.body,
        String(this.created_at),
        String(this.updated_at)
      ]);
      console.log(query);
      const client = await this.connect();
      client.query(query);
      client.release();
    } catch (error) {
      return error.message;
    }
  }

  protected createSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(/\s/g, "-");
  }
}
