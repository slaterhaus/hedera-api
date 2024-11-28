import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * For possible customization if needed
 */

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
