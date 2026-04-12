import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../../common/guards/admin.guard';

@Module({
  imports: [AuthModule],
  controllers: [StatisticsController],
  providers: [StatisticsService, AdminGuard],
  exports: [StatisticsService],
})
export class StatisticsModule {}
