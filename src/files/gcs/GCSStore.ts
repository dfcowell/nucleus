import * as debug from 'debug';

import * as config from '../../config';

const Storage = require('@google-cloud/storage');
const d = debug('nucleus:gcs');

const gcs = new Storage();

export default class GCSStore implements IFileStore {
  private bucket: any;

  constructor(private gcsConfig = config.gcs) {
    this.bucket = gcs.bucket(this.gcsConfig.bucketName);
  }

  public async putFile(key: string, data: Buffer, overwrite = false) {
    d(`Putting file: '${key}', overwrite=${overwrite ? 'true' : 'false'}`);
    const file = this.bucket.file(key);

    let wrote = false;
    if (overwrite || !await file.exists()) {
      d(`Deciding to write file (either because overwrite is enabled or the key didn't exist)`);
      const writeStream = file.createWriteStream({ gzip: true });

      await new Promise((resolve, reject) => {
        writeStream
          .on('error', reject)
          .on('finish', resolve)
          .end(data);
      });

      await file.makePublic();

      wrote = true;
    }
    if (overwrite && this.gcsConfig.cloudCdn) {
      d(`Cloud CDN config detected, sending invalidation request for: '${key}'`);
      // TODO: invalidate CDN cache
    }
    return wrote;
  }

  public async getFile(key: string) {
    d(`Fetching file: '${key}'`);
    const file = this.bucket.file(key);
    
    try {
      const [contents] = await file.download();

      return contents;
    } catch (err) {
      // File may not exist, default to empty buffer
      return new Buffer('');
    }
  }

  public async deletePath(key: string) {
    d(`Deleting files under path: '${key}'`);
    await this.bucket.deleteFiles({
      prefix: key,
      force: true
    });
  }

  public async getPublicBaseUrl() {
    if (this.gcsConfig.cloudCdn) {
      return this.gcsConfig.cloudCdn.publicUrl;
    }
    return `https://${this.gcsConfig.bucketName}.storage.googleapis.com`;
  }

  public async listFiles(prefix: string) {
    d(`Listing files under path: '${prefix}'`);
    const [files] = await this.bucket.getFiles({
      prefix
    });

    return files.map((file: any) => file.name);
  }
}
