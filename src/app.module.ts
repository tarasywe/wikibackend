import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { CacheModule } from "@nestjs/cache-manager";
import { FeedModule } from "./feed/feed.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 300000, // 5 minutes default
    }),
    FeedModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
