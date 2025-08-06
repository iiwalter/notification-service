import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class NotifyDto {
  @IsUUID()
  @IsNotEmpty()
  messageId: string;

  @IsString()
  @IsNotEmpty({ message: 'Message content cannot be empty' })
  messageContent: string;
}

