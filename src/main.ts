import { S3Client } from '@aws-sdk/client-s3';
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { TemporaryCredential } from './model';
import { config } from 'dotenv';
import { httpClient } from './http-client';
import { appConfig } from './config';
import { createRandomFileKey } from './util';
import { Upload } from '@aws-sdk/lib-storage';
config();

const FILE_DIR = path.join(__dirname, '../files');

async function bootstrap(): Promise<void> {
  const credential = await getTempCredential();
  const s3Client = createS3Client();
  const files = await readdir(FILE_DIR);
  createUploadTasks(s3Client);

  function createS3Client(): S3Client {
    return new S3Client({
      region: appConfig.aws_region,
      credentials: {
        accessKeyId: credential.accessKeyId,
        secretAccessKey: credential.secretAccessKey,
        sessionToken: credential.sessionToken,
      },
    });
  }

  async function getTempCredential(): Promise<TemporaryCredential> {
    const token = (
      await httpClient.post<{ accessToken: string }>('/auth/signin', {
        username: appConfig.username,
        password: appConfig.password,
      })
    ).data.accessToken;

    const { data: result } = await httpClient.get<TemporaryCredential>(
      '/auth/temp-credential',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return result;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function createUploadTasks(_s3Client: S3Client) {
    const uploads = files.map(async (f) =>
      new Upload({
        client: _s3Client,
        params: {
          ACL: 'public-read',
          ContentDisposition: `attachment;filename=${f}`,
          Bucket: appConfig.aws_bucket_name,
          Key: createRandomFileKey(),
          Body: await readFile(path.join(FILE_DIR, f)),
        },
      }).on('httpUploadProgress', (progress) => {
        console.log(progress);
      }),
    );

    const tasks = Promise.all(uploads.map(async (u) => (await u).done()));

    console.log(tasks);
  }
}

bootstrap();
