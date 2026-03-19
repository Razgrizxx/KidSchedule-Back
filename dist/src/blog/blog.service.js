"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BlogService = class BlogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    calcReadTime(content) {
        const words = content.trim().split(/\s+/).length;
        return Math.max(1, Math.round(words / 200));
    }
    async findAll() {
        return this.prisma.post.findMany({
            where: { published: true },
            orderBy: { publishedAt: 'desc' },
            select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                coverImage: true,
                category: true,
                author: true,
                readTime: true,
                publishedAt: true,
            },
        });
    }
    async findBySlug(slug) {
        const post = await this.prisma.post.findUnique({ where: { slug } });
        if (!post || !post.published)
            throw new common_1.NotFoundException('Post not found');
        return post;
    }
    async create(dto) {
        const readTime = this.calcReadTime(dto.content);
        return this.prisma.post.create({
            data: {
                ...dto,
                readTime,
                publishedAt: dto.published ? new Date() : null,
            },
        });
    }
    async update(slug, dto) {
        const post = await this.prisma.post.findUnique({ where: { slug } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const readTime = dto.content ? this.calcReadTime(dto.content) : post.readTime;
        return this.prisma.post.update({
            where: { slug },
            data: {
                ...dto,
                readTime,
                ...(dto.published && !post.published ? { publishedAt: new Date() } : {}),
            },
        });
    }
    async remove(slug) {
        const post = await this.prisma.post.findUnique({ where: { slug } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        await this.prisma.post.delete({ where: { slug } });
        return { message: 'Post deleted' };
    }
    async findRelated(slug, category) {
        return this.prisma.post.findMany({
            where: { published: true, category, slug: { not: slug } },
            orderBy: { publishedAt: 'desc' },
            take: 3,
            select: {
                slug: true,
                title: true,
                excerpt: true,
                coverImage: true,
                category: true,
                readTime: true,
                publishedAt: true,
            },
        });
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogService);
//# sourceMappingURL=blog.service.js.map