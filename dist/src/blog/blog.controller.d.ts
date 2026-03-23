import { BlogService } from './blog.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
export declare class BlogController {
    private blogService;
    constructor(blogService: BlogService);
    findAll(): Promise<{
        id: string;
        category: string;
        slug: string;
        title: string;
        excerpt: string;
        coverImage: string | null;
        author: string;
        readTime: number;
        publishedAt: Date | null;
    }[]>;
    findOne(slug: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        category: string;
        slug: string;
        title: string;
        excerpt: string;
        coverImage: string | null;
        author: string;
        readTime: number;
        published: boolean;
        publishedAt: Date | null;
    }>;
    findRelated(slug: string): Promise<{
        category: string;
        slug: string;
        title: string;
        excerpt: string;
        coverImage: string | null;
        readTime: number;
        publishedAt: Date | null;
    }[]>;
    create(dto: CreatePostDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        category: string;
        slug: string;
        title: string;
        excerpt: string;
        coverImage: string | null;
        author: string;
        readTime: number;
        published: boolean;
        publishedAt: Date | null;
    }>;
    update(slug: string, dto: UpdatePostDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        category: string;
        slug: string;
        title: string;
        excerpt: string;
        coverImage: string | null;
        author: string;
        readTime: number;
        published: boolean;
        publishedAt: Date | null;
    }>;
    remove(slug: string): Promise<{
        message: string;
    }>;
}
