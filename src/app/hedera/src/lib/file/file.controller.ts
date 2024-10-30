import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post, Req,
  Res,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { Response } from 'express';
import { Client, FileContentsQuery } from '@hashgraph/sdk';

@Controller('files')
export class FileController {
  constructor(
    @Inject('HEDERA_CLIENT')
    private readonly client: Client,
    private readonly fileService: FileService
  ) {}

  @Post('upload/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.uploadImage(file);
  }
  @Post('upload/json')
  async uploadJson(@Body() body: Record<string, any>) {
    return await this.fileService.uploadJSON(body);
  }

  @Get('images')
  async getImageReferences() {
    return await this.fileService.getImageReferences();
  }

  @Get('file/:fileId')
  async getFileInfo(@Param('fileId') fileId: string) {
    return await this.fileService.getFileById(fileId);
  }
  //
  // @Get('file/:fileId')
  // async getFileContents(@Param('fileId') fileId: string, @Res() res: Response) {
  //   try {
  //     const query = new FileContentsQuery().setFileId(fileId);
  //
  //     const contents = await query.execute(this.client);
  //
  //     // Convert ByteString to Buffer
  //     const imageBuffer = Buffer.from(contents);
  //
  //     // Don't return an object, send the buffer directly with headers
  //     return res
  //       .contentType('image/jpeg')
  //       .header('Content-Length', imageBuffer.length.toString())
  //       .send(imageBuffer);
  //   } catch (error: any) {
  //     res.status(500).send(error.message);
  //   }
  //   return res.send({});
  // }
}
