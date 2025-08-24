import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ChatSession } from './chatHistory';

const s3Client = new S3Client({
  region: 'us-east-1',
});

const BUCKET_NAME = 'anime-gpt-assets';
const CHAT_HISTORY_PREFIX = 'chat-history/';

export const saveToS3 = async (key: string, data: ChatSession): Promise<void> => {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${CHAT_HISTORY_PREFIX}${key}.json`,
        Body: JSON.stringify(data),
        ContentType: 'application/json',
      })
    );
  } catch (error) {
    console.error('Error saving to S3:', error);
    throw error;
  }
};

export const getFromS3 = async (key: string): Promise<ChatSession | null> => {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${CHAT_HISTORY_PREFIX}${key}.json`,
      })
    );
    
    const str = await response.Body?.transformToString();
    return str ? JSON.parse(str) : null;
  } catch (error: unknown) {
    if (error instanceof Error && 'name' in error && error.name === 'NoSuchKey') {
    if (error.name === 'NoSuchKey') {
      return null;
    }
    console.error('Error getting from S3:', error);
    throw error;
  }
}
};

export const listFromS3 = async (): Promise<string[]> => {
  try {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: CHAT_HISTORY_PREFIX,
      })
    );
    
    return (response.Contents || [])
      .map(item => item.Key || '')
      .filter(key => key.endsWith('.json'))
      .map(key => key.replace(CHAT_HISTORY_PREFIX, '').replace('.json', ''));
  } catch (error) {
    console.error('Error listing from S3:', error);
    throw error;
  }
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${CHAT_HISTORY_PREFIX}${key}.json`,
      })
    );
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};
