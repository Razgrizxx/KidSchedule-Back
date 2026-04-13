import { BlogService } from './blog.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
export declare class BlogController {
    private blogService;
    constructor(blogService: BlogService);
    findAll(): Promise<{
        id: string;
        title: string;
        category: string;
        slug: string;
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
        title: string;
        content: string;
        category: string;
        slug: string;
        excerpt: string;
        coverImage: string | null;
        author: string;
        published: boolean;
        readTime: number;
        publishedAt: Date | null;
    }>;
    findRelated(slug: string): Promise<{
        title: string;
        category: string;
        slug: string;
        excerpt: string;
        coverImage: string | null;
        readTime: number;
        publishedAt: Date | null;
    }[]>;
    findAllAdmin(): Promise<{
        id: string;
        title: string;
        category: string;
        slug: string;
        excerpt: string;
        coverImage: string | null;
        author: string;
        published: boolean;
        readTime: number;
        publishedAt: Date | null;
    }[]>;
    create(dto: CreatePostDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        category: string;
        slug: string;
        excerpt: string;
        coverImage: string | null;
        author: string;
        published: boolean;
        readTime: number;
        publishedAt: Date | null;
    }>;
    update(slug: string, dto: UpdatePostDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        category: string;
        slug: string;
        excerpt: string;
        coverImage: string | null;
        author: string;
        published: boolean;
        readTime: number;
        publishedAt: Date | null;
    }>;
    remove(slug: string): Promise<{
        message: string;
    }>;
}
