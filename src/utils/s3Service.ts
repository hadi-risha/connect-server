// S3 upload function
import AWS from 'aws-sdk';
import config from '../config/config';
import express, { Request, Response } from 'express';

const router = express.Router();

export const s3 = new AWS.S3({
  accessKeyId: config.awsAccessKey, 
  secretAccessKey: config.awsSecretKey, 
  region: config.awsRegion, 
});

export async function uploadImageToS3(file: Express.Multer.File): Promise<{ url: string, key: string }> {
  try {
    const key = `profile-pics/${Date.now()}-${file.originalname}`;
    const params = {
      Bucket: config.awsBucketName!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const { Location } = await s3.upload(params).promise();
    // return Location;
    return { url: Location, key };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image');
  }
}

export const deleteImageFromS3 = async (key: string): Promise<void> => {
  const params = {
    Bucket: config.awsBucketName!,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};
