import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { CashingOptions } from 'src/config/redis.config';
@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis(CashingOptions);
  }
  // ________________________________________________________________
  // add ro redis
  addToRedisCache = async (
    key: string,
    payload: any,
    time = 360 * 24 * 60 * 60,
  ) => {
    await this.redis.set(key, payload, 'EX', time);
  };
  // ________________________________________________________________
  // get from redis
  getFromRedisCache = async (key: string) => await this.redis.get(key);
  // ________________________________________________________________
  // get time to live by key
  async getTimeToLive(key: string): Promise<number> {
    const ttl = await this.redis.ttl(key);
    return ttl;
  }

  // ________________________________________________________________
  // Find all keys matching the given key
  getKeysFromRedisCache = async (key: string) => await this.redis.keys(key);
  // ________________________________________________________________
  // delete from redis
  deleteFromRedis = async (pattern: string): Promise<void> => {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  };
  // ________________________________________________________________
  // empty all redis
  emptyRedis = async () => {
    let all = await this.redis.keys('*', (err) => {
      if (err) return console.log(err);
    });
    all.forEach(async (element) => {
      this.deleteFromRedis(element);
    });
  };
}
