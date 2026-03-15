import path from 'node:path';
import { tests } from '@iobroker/testing';

// Validate package.json and io-package.json
// __dirname is build/test/ after compilation, so we need ../.. to reach project root
tests.packageFiles(path.join(__dirname, '..', '..'));
