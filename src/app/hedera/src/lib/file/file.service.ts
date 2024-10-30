import {
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TopicService } from '../topic/topic.service';
import {
  Client,
  FileContentsQuery,
  FileCreateTransaction,
  Hbar,
  PrivateKey,
  PublicKey,
  TopicMessageSubmitTransaction,
} from '@hashgraph/sdk';
import axios from 'axios';
import { MirrorNodeMessage } from '../types';
import { FileInterceptor } from '@nestjs/platform-express';

@Injectable()
export class FileService {
  private readonly imagesTopicId: string = process.env['IMAGES_TOPIC_ID']!;
  private readonly mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';
  private publicKey = process.env['DER_ENCODED_PUBLIC_KEY'];
  private filePublicKey = PublicKey.fromStringED25519(
    process.env['DER_ENCODED_PUBLIC_KEY'] as string
  );
  private fileKey = PrivateKey.fromStringED25519(
    process.env['DER_ENCODED_PRIVATE_KEY'] as string
  );

  constructor(
    @Inject('HEDERA_CLIENT')
    private readonly client: Client,
    private readonly topicService: TopicService
  ) {}

  async getFileById(fileId: string) {
    try {
      const query = new FileContentsQuery().setFileId(fileId);

      const contents = await query.execute(this.client);
      return Buffer.from(contents).toString('utf8');
    } catch (error: any) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async uploadJSON(json: Record<any, any>) {
    try {
      // First create the file
      const transaction = new FileCreateTransaction()
        .setKeys([this.filePublicKey])
        .setContents(JSON.stringify(json))
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(this.client);

      const signTx = await transaction.sign(this.fileKey);
      const submitTx = await signTx.execute(this.client);
      const receipt = await submitTx.getReceipt(this.client);
      const fileId = receipt.fileId;

      // Then store reference in JSON topic
      const jsonTopicId = process.env['JSON_TOPIC_ID'];
      if (!jsonTopicId) {
        throw new Error('JSON_TOPIC_ID environment variable is not set');
      }

      // Create metadata message
      const topicMessage = {
        type: 'JSON',
        fileId: fileId?.toString(),
        timestamp: new Date().toISOString(),
        fullReceipt: receipt.toJSON(),
        metadata: {
          size: Buffer.from(JSON.stringify(json)).length,
          description: 'JSON File Upload',
        },
      };

      // Submit to topic
      const messageSubmitTx = await new TopicMessageSubmitTransaction()
        .setTopicId(jsonTopicId)
        .setMessage(JSON.stringify(topicMessage))
        .execute(this.client);

      const messageReceipt = await messageSubmitTx.getReceipt(this.client);

      return {
        fileId: fileId?.toString(),
        topicId: jsonTopicId,
        topicSequenceNumber: messageReceipt.topicSequenceNumber,
        timestamp: topicMessage.timestamp,
        metadata: topicMessage.metadata,
      };
    } catch (error: any) {
      console.error('Error in uploadJSON:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async uploadImage(file: Express.Multer.File) {
    try {
      console.log('File received:', {
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });

      const transaction = new FileCreateTransaction()
        .setKeys([this.filePublicKey])
        .setContents(file.buffer)
        .setFileMemo(file.originalname)
        .setMaxTransactionFee(new Hbar(2));

      console.log('Transaction created');

      // Freeze and log any errors
      let frozenTx;
      try {
        frozenTx = transaction.freezeWith(this.client);
        console.log('Transaction frozen');
      } catch (freezeError) {
        console.error('Freeze error:', freezeError);
        throw freezeError;
      }

      // Sign and log any errors
      let signedTx;
      try {
        signedTx = await frozenTx.sign(this.fileKey);
        console.log('Transaction signed');
      } catch (signError) {
        console.error('Signing error:', signError);
        throw signError;
      }

      // Execute and log any errors
      let submitTx;
      try {
        submitTx = await signedTx.execute(this.client);
        console.log('Transaction executed');
      } catch (executeError) {
        console.error('Execute error:', executeError);
        throw executeError;
      }

      // Get receipt and log any errors
      try {
        const receipt = await submitTx.getReceipt(this.client);
        console.log('Receipt received:', receipt);
        return receipt;
      } catch (receiptError) {
        console.error('Receipt error:', receiptError);
        throw receiptError;
      }
    } catch (error) {
      console.error('Full error details:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
          details: error.toString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getImageReferences() {
    try {
      const response = await axios.get(
        `${this.mirrorNodeUrl}/api/v1/topics/${this.imagesTopicId}/messages`
      );

      const fileReferences = response.data.messages
        .map((msg: MirrorNodeMessage) => {
          try {
            const decodedMessage = Buffer.from(
              msg.message,
              'base64'
            ).toString();
            const messageContent = JSON.parse(decodedMessage);

            if (messageContent.type === 'FILE_REFERENCE') {
              return {
                fileId: messageContent.fileId,
                filename: messageContent.filename,
                mimeType: messageContent.mimeType,
                size: messageContent.size,
                timestamp: messageContent.timestamp,
              };
            }
            return null;
          } catch (error) {
            console.error('Error parsing message:', error);
            return null;
          }
        })
        .filter(Boolean);

      return {
        files: fileReferences,
        count: fileReferences.length,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error?.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @Post('upload/json')
  @UseInterceptors(FileInterceptor('file'))
  async uploadJsonFile(@UploadedFile() file: Express.Multer.File) {
    try {
      // Verify it's a JSON file
      if (file.mimetype !== 'application/json') {
        throw new HttpException('File must be JSON', HttpStatus.BAD_REQUEST);
      }

      // Parse the JSON to verify it's valid
      const jsonContent = JSON.parse(file.buffer.toString());

      // Convert back to string for storage
      const jsonString = JSON.stringify(jsonContent);

      const transaction = new FileCreateTransaction()
        .setKeys([this.filePublicKey])
        .setContents(jsonString)
        .setFileMemo(file.originalname)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(this.client);

      const signTx = await transaction.sign(this.fileKey);
      const submitTx = await signTx.execute(this.client);
      const receipt = await submitTx.getReceipt(this.client);

      return {
        fileId: receipt.fileId,
        size: Buffer.from(jsonString).length,
        name: file.originalname,
        contentType: 'application/json',
        receipt: receipt.toJSON(),
      };
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        throw new HttpException('Invalid JSON format', HttpStatus.BAD_REQUEST);
      }
      console.error('Error details:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Add a getter for JSON files
  @Get('json/:fileId')
  async getJsonContents(@Param('fileId') fileId: string) {
    try {
      const query = new FileContentsQuery().setFileId(fileId);

      const contents = await query.execute(this.client);

      // Parse the JSON content
      const jsonContent = JSON.parse(contents.toString());

      return jsonContent;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpException('Invalid JSON content', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
