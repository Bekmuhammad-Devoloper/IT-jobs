import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { RatingModule } from '../rating/rating.module';

@Module({
  imports: [RatingModule],
  providers: [TasksService],
})
export class TasksModule {}
