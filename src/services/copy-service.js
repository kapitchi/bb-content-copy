const request = require('request');
const fs = require('fs');
const rp = require('request-promise-native');
const progress = require('progress-stream');
const _ = require('lodash');
const {AbstractService, Joi} = require('@kapitchi/bb-service');

/**
 * @typedef {Object} HttpMethod
 * @property {string} type Value: http
 * @property {string} url
 * @property {string} method HTTP method
 * @property {Object} headers
 */

/**
 * @typedef {Object} FilesystemMethod
 * @property {string} type Value: filesystem
 * @property {string} path File path
 */

/**
 * Content copy service
 */
class CopyService extends AbstractService {
  /**
   * @param {Object} copyServiceOpts
   * @param {number} copyServiceOpts.progressUpdatePeriod How often is copyServiceProgress.next() is called
   * @param {Object} copyServiceProgress
   * @param {Function} copyServiceProgress.next
   */
  constructor(copyServiceOpts, copyServiceProgress) {
    super(copyServiceOpts, {
      progressUpdatePeriod: Joi.number().optional().default(5000),
    });

    this.copyServiceProgress = copyServiceProgress;

    this.allowedSources = ['http', 'filesystem'];
    this.allowedDestinations = ['http', 'filesystem'];
  }

  /**
   * Copy source to destination
   *
   * @param {Object} params
   * @param {string} params.id Unique copy operation ID
   * @param {FilesystemMethod|HttpMethod} params.source
   * @param {number} [params.source.size] Content size (if not provided it will be detected)
   * @param {number} [params.source.mime] MIME type of the content (if not provided it will be detected)
   * @param {FilesystemMethod|HttpMethod} params.destination
   * @returns {Promise}
   */
  async copy(params) {
    params = this.params(params, {
      id: Joi.string(),
      source: Joi.object({
        type: Joi.string().allow(...this.allowedSources),
        size: Joi.number().optional(),
        mime: Joi.string().optional()
      }),
      destination: Joi.object({
        type: Joi.string().allow(...this.allowedDestinations)
      })
    }, false);

    const source = this.validateMethod(params.source);
    const destination = this.validateMethod(params.destination);

    let needSize = !source.size;
    let needMime = destination.type === 'http' && !source.mime;

    //TODO do we always need size/mime for http destination? It's needed for s3 if I remember correctly.
    if (source.type === 'http' && (needSize || needMime)) {
      this.logger.log({
        level: 'debug',
        msg: `${params.id}: HEAD request [${source.url}]`
      });

      const headRes = await rp({
        url: source.url,
        method: 'HEAD',
        headers: source.headers,
        resolveWithFullResponse: true
      });

      const headers = headRes.headers;
      if (!source.size) {
        source.size = headers['content-length'];
      }
      if (!source.mime) {
        source.mime = headers['content-type'];
      }
      this.logger.log({
        level: 'debug',
        msg: `${params.id}: Response [${source.url}]: size=${headers['content-length']}, mime=${headers['content-type']}`
      });
    }

    if (source.type === 'filesystem') {
      if (needSize) {
        const stat = fs.statSync(source.path);
        source.size = stat.size;

        this.logger.log({
          level: 'debug',
          msg: `${params.id}: Stat file: ${source.path}: size=${stat.size}`
        })
      }

      if (needMime) {
        //TODO mime
        this.logger.log({
          level: 'warn',
          msg: `${params.id}: File ${source.path}: TODO Can not recognize mime`
        });
      }
    }

    if (!source.size) {
      throw new Error('No source.size provided');
    }

    destination.size = source.size;
    destination.mime = source.mime;

    return new Promise((resolve, reject) => {
      const stats = progress({
        length: source.size,
        time: this.options.progressUpdatePeriod
      });

      let stat;
      stats.on('progress', (s) => {
        stat = s;
        this.copyServiceProgress.next({
          id: params.id,
          stat: s,
        });
      });

      this.logger.log({
        level: 'debug',
        msg: `${params.id}: copying started`
      });

      this.createReadStream(source).pipe(stats).pipe(this.createWriteStream(destination, (data) => {
        this.logger.log({
          level: 'debug',
          msg: `${params.id}: copying finished`
        });
        resolve({
          data,
          stat
        });
      }, reject));
    });
  }

  createReadStream(method) {
    switch (method.type) {
      case 'http':
        const requestParams = {
          url: method.url,
          method: method.method,
        };
        if (method.headers) {
          requestParams.headers = method.headers;
        }
        return request(requestParams);
      case 'filesystem':
        return fs.createReadStream(method.path);
      default:
        throw new Error('Unknown method type:' + method.type);
    }
  }

  createWriteStream(method, resolve, reject) {
    switch (method.type) {
      case 'http':
        const requestParams = {
          url: method.url,
          method: method.method,
          headers: _.defaults({}, method.headers, {
            'content-type': method.mime,
            'content-length': method.size
          })
        };
        return request(requestParams, (err, res, body) => {
          if (err) {
            return reject(err);
          }
          if(res.headers['content-type'].indexOf('application/json') === 0) {
            body = JSON.parse(body);
          }
          resolve({
            body
          });
        });
      case 'filesystem':
        const stream = fs.createWriteStream(method.path);
        stream.on('finish', resolve);
        stream.on('error', reject);
        return stream;
      default:
        throw new Error('Unknown method type:' + method.type);
    }
  }

  validateMethod(params) {
    switch (params.type) {
      case 'http':
        return this.params(params, Joi.object({
          url: Joi.string(),
          method: Joi.string(),
          headers: Joi.object().optional(),
        }), false);
      case 'filesystem':
        return this.params(params, Joi.object({
          path: Joi.string(),
        }), false);
    }
  }
}

module.exports = CopyService;
