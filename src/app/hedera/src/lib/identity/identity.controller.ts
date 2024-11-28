import { Controller, Post, Body, Get, Put, UseGuards, Headers } from '@nestjs/common';


import { CreateIdentityDto, LoginDto, UserIdentity } from '../types/identity';
import { IdentityService } from './identity.service';
import { JwtAuthGuard } from './identity.guard';

@Controller('did')
export class DIDController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('register')
  async createIdentity(@Body() createIdentityDto: CreateIdentityDto) {
    return this.identityService.createIdentity(createIdentityDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.identityService.login(loginDto);
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyIdentity(@Headers('Authorization') auth: string) {
    const token = auth.split(' ')[1];
    return this.identityService.verifyIdentity(token);
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateIdentity(
    @Headers('Authorization') auth: string,
    @Body() updates: Partial<UserIdentity>
  ) {
    const token = auth.split(' ')[1];
    return this.identityService.updateIdentity(token, updates);
  }
}
