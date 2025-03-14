import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { TranslationService } from './translation.service';

@Module({
  imports: [HttpModule],
  controllers: [FeedController],
  providers: [FeedService, TranslationService],
})
export class FeedModule {}