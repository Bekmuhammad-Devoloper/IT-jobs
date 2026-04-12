import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin-users.controller';
import { AdminPostsController } from './admin-posts.controller';
import { AdminModerationController } from './admin-moderation.controller';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../../common/guards/admin.guard';

@Module({
  imports: [AuthModule],
  controllers: [
    AdminUsersController,
    AdminPostsController,
    AdminModerationController,
    AdminSettingsController,
  ],
  providers: [AdminService, AdminGuard],
  exports: [AdminService],
})
export class AdminModule {}
