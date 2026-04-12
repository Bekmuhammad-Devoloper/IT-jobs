import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostFilterDto } from './dto/post-filter.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TelegramAuthGuard } from '../../common/guards/telegram-auth.guard';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(TelegramAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  create(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts with filters' })
  findAll(@Query() filters: PostFilterDto) {
    return this.postsService.findAll(filters);
  }

  @Get('my')
  @UseGuards(TelegramAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user posts' })
  getMyPosts(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.getUserPosts(user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Record a post view' })
  addView(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId') userId?: number,
    @Body('fingerprint') fingerprint?: string,
  ) {
    return this.postsService.addView(id, userId, fingerprint);
  }

  @Delete(':id')
  @UseGuards(TelegramAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own post' })
  delete(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id, user.id);
  }
}
