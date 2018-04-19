import S3Store from './s3/S3Store';
import LocalStore from './local/LocalStore';
import GCSStore from './gcs/GCSStore';

import { fileStrategy } from '../config';

let store: IFileStore;

switch (fileStrategy) {
  case 's3':
    store = new S3Store();
    break;
  case 'gcs':
    store = new GCSStore();
    break;
  case 'local':
  default:
    store = new LocalStore();
}

export default store;
