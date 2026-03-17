import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  private calcReadTime(content: string): number {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200)); // ~200 wpm
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

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (!post || !post.published) throw new NotFoundException('Post not found');
    return post;
  }

  async create(dto: CreatePostDto) {
    const readTime = this.calcReadTime(dto.content);
    return this.prisma.post.create({
      data: {
        ...dto,
        readTime,
        publishedAt: dto.published ? new Date() : null,
      },
    });
  }

  async update(slug: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Post not found');
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

  async remove(slug: string) {
    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Post not found');
    await this.prisma.post.delete({ where: { slug } });
    return { message: 'Post deleted' };
  }

  async findRelated(slug: string, category: string) {
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
}
