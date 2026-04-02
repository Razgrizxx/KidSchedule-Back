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
import { AdminGuard } from '../common/guards/admin.guard';

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

  // ── Admin endpoints (site owner only) ──────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin() {
    return this.blogService.findAllAdmin();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreatePostDto) {
    return this.blogService.create(dto);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('slug') slug: string, @Body() dto: UpdatePostDto) {
    return this.blogService.update(slug, dto);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('slug') slug: string) {
    return this.blogService.remove(slug);
  }
}
