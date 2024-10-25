import { Controller, Get } from '@nestjs/common';
import { HealthcheckService } from './healthcheck.service';

@Controller('health')
export class HederaHealthController {
  constructor(private readonly healthService: HealthcheckService) {}

  @Get()
  async checkHealth() {
    return this.healthService.checkHealth();
  }
}
