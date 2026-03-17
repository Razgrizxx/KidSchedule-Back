import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  // ── Public endpoints (no auth) ──────────────────────────────────────────

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Get(':slug/related')
  async findRelated(@Param('slug') slug: string) {
    const post = await this.blogService.findBySlug(slug);
    return this.blogService.findRelated(slug, post.category);
  }

  // ── Admin endpoints (JWT required) ─────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePostDto) {
    return this.blogService.create(dto);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  update(@Param('slug') slug: string, @Body() dto: UpdatePostDto) {
    return this.blogService.update(slug, dto);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  remove(@Param('slug') slug: string) {
    return this.blogService.remove(slug);
  }
}
