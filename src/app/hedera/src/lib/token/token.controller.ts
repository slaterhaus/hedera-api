import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TokensService } from './token.service';
import { CreateTokenDto, TransferTokenDto } from '../types/token';

@Controller('tokens')
export class PropertyTokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post()
  // @UseGuards(AuthGuard) // later?
  async createToken(@Body() createTokenDto: CreateTokenDto) {
    return this.tokensService.createRWAToken(createTokenDto);
  }

  @Post('transfer')
  // @UseGuards(AuthGuard)
  async transferTokens(@Body() transferDto: TransferTokenDto) {
    return this.tokensService.transferTokens(transferDto);
  }

  @Get(':tokenId')
  async getTokenInfo(@Param('tokenId') tokenId: string) {
    return this.tokensService.getTokenInfo(tokenId);
  }
}
