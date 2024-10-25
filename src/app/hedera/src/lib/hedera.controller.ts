import { Controller } from '@nestjs/common';
import { HederaService } from './hedera.service';

@Controller('hedera')
export class HederaController {
  constructor(private hederaService: HederaService) {}
}
