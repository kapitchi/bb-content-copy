const CopyService = require('../src/services/copy-service');

describe('Example: Filesystem copy operation', () => {
  it('filesystem -> filesystem', async () => {
    const service = new CopyService({}, {
      next: (progress) => {
        console.log(progress); //XXX
      }
    });
    service.setLogger({
      log: (entry) => {
        console.log(entry); //XXX
      }
    });

    const destFile = __dirname + '/tmp/test-file';

    const ret = await service.copy({
      id: 'copy-operation-unique-id',
      source: {
        type: 'filesystem',
        path: __filename
      },
      destination: {
        type: 'filesystem',
        path: destFile
      }
    });
    console.log(ret); //XXX
  });

  it('url -> filesystem', async function() {
    this.timeout(10000);

    const service = new CopyService({}, {
      next: (progress) => {
        console.log(progress); //XXX
      }
    });
    service.setLogger({
      log: (entry) => {
        console.log(entry); //XXX
      }
    });

    const destFile = __dirname + '/tmp/image.png';
    const ret = await service.copy({
      id: 'copy-operation-unique-id',
      source: {
        type: 'http',
        url: 'https://avatars1.githubusercontent.com/u/932273?s=200&v=4',
        method: 'get'
      },
      destination: {
        type: 'filesystem',
        path: destFile
      }
    });
    console.log(ret); //XXX
  });
});
