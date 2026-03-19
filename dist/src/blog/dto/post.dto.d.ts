export declare class CreatePostDto {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    category?: string;
    author?: string;
    published?: boolean;
}
declare const UpdatePostDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePostDto>>;
export declare class UpdatePostDto extends UpdatePostDto_base {
}
export {};
