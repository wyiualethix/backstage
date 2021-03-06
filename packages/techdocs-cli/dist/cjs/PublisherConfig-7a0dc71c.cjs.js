'use strict';

var config = require('@backstage/config');

const _PublisherConfig = class {
  static getValidConfig(opts) {
    const publisherType = opts.publisherType;
    if (!_PublisherConfig.isKnownPublisher(publisherType)) {
      throw new Error(`Unknown publisher type ${opts.publisherType}`);
    }
    return new config.ConfigReader({
      backend: {
        baseUrl: "http://localhost:7007",
        listen: {
          port: 7007
        }
      },
      techdocs: {
        publisher: _PublisherConfig.configFactories[publisherType](opts),
        legacyUseCaseSensitiveTripletPaths: opts.legacyUseCaseSensitiveTripletPaths
      }
    });
  }
  static isKnownPublisher(type) {
    return _PublisherConfig.configFactories.hasOwnProperty(type);
  }
  static getValidAwsS3Config(opts) {
    return {
      type: "awsS3",
      awsS3: {
        bucketName: opts.storageName,
        ...opts.awsBucketRootPath && {
          bucketRootPath: opts.awsBucketRootPath
        },
        ...opts.awsRoleArn && { credentials: { roleArn: opts.awsRoleArn } },
        ...opts.awsEndpoint && { endpoint: opts.awsEndpoint },
        ...opts.awsS3ForcePathStyle && { s3ForcePathStyle: true },
        ...opts.awsS3sse && { sse: opts.awsS3sse }
      }
    };
  }
  static getValidAzureConfig(opts) {
    if (!opts.azureAccountName) {
      throw new Error(`azureBlobStorage requires --azureAccountName to be specified`);
    }
    return {
      type: "azureBlobStorage",
      azureBlobStorage: {
        containerName: opts.storageName,
        credentials: {
          accountName: opts.azureAccountName,
          accountKey: opts.azureAccountKey
        }
      }
    };
  }
  static getValidGoogleGcsConfig(opts) {
    return {
      type: "googleGcs",
      googleGcs: {
        bucketName: opts.storageName,
        ...opts.gcsBucketRootPath && {
          bucketRootPath: opts.gcsBucketRootPath
        }
      }
    };
  }
  static getValidOpenStackSwiftConfig(opts) {
    const missingParams = [
      "osCredentialId",
      "osSecret",
      "osAuthUrl",
      "osSwiftUrl"
    ].filter((param) => !opts[param]);
    if (missingParams.length) {
      throw new Error(`openStackSwift requires the following params to be specified: ${missingParams.join(", ")}`);
    }
    return {
      type: "openStackSwift",
      openStackSwift: {
        containerName: opts.storageName,
        credentials: {
          id: opts.osCredentialId,
          secret: opts.osSecret
        },
        authUrl: opts.osAuthUrl,
        swiftUrl: opts.osSwiftUrl
      }
    };
  }
};
let PublisherConfig = _PublisherConfig;
PublisherConfig.configFactories = {
  awsS3: _PublisherConfig.getValidAwsS3Config,
  azureBlobStorage: _PublisherConfig.getValidAzureConfig,
  googleGcs: _PublisherConfig.getValidGoogleGcsConfig,
  openStackSwift: _PublisherConfig.getValidOpenStackSwiftConfig
};

exports.PublisherConfig = PublisherConfig;
//# sourceMappingURL=PublisherConfig-7a0dc71c.cjs.js.map
