'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var errors = require('@backstage/errors');
var jose = require('jose');

function getBearerTokenFromAuthorizationHeader(authorizationHeader) {
  if (typeof authorizationHeader !== "string") {
    return void 0;
  }
  const matches = authorizationHeader.match(/^Bearer[ ]+(\S+)$/i);
  return matches == null ? void 0 : matches[1];
}

const CLOCK_MARGIN_S = 10;
class IdentityClient {
  constructor(options) {
    this.keyStoreUpdated = 0;
    var _a;
    this.discovery = options.discovery;
    this.issuer = options.issuer;
    this.algorithms = (_a = options.algorithms) != null ? _a : ["ES256"];
  }
  static create(options) {
    return new IdentityClient(options);
  }
  async authenticate(token) {
    if (!token) {
      throw new errors.AuthenticationError("No token specified");
    }
    await this.refreshKeyStore(token);
    if (!this.keyStore) {
      throw new errors.AuthenticationError("No keystore exists");
    }
    const decoded = await jose.jwtVerify(token, this.keyStore, {
      algorithms: this.algorithms,
      audience: "backstage",
      issuer: this.issuer
    });
    if (!decoded.payload.sub) {
      throw new errors.AuthenticationError("No user sub found in token");
    }
    const user = {
      token,
      identity: {
        type: "user",
        userEntityRef: decoded.payload.sub,
        ownershipEntityRefs: decoded.payload.ent ? decoded.payload.ent : []
      }
    };
    return user;
  }
  async refreshKeyStore(rawJwtToken) {
    const payload = await jose.decodeJwt(rawJwtToken);
    const header = await jose.decodeProtectedHeader(rawJwtToken);
    let keyStoreHasKey;
    try {
      if (this.keyStore) {
        const [_, rawPayload, rawSignature] = rawJwtToken.split(".");
        keyStoreHasKey = await this.keyStore(header, {
          payload: rawPayload,
          signature: rawSignature
        });
      }
    } catch (error) {
      keyStoreHasKey = false;
    }
    const issuedAfterLastRefresh = (payload == null ? void 0 : payload.iat) && payload.iat > this.keyStoreUpdated - CLOCK_MARGIN_S;
    if (!keyStoreHasKey && issuedAfterLastRefresh) {
      const url = await this.discovery.getBaseUrl("auth");
      const endpoint = new URL(`${url}/.well-known/jwks.json`);
      this.keyStore = jose.createRemoteJWKSet(endpoint);
      this.keyStoreUpdated = Date.now() / 1e3;
    }
  }
}

exports.IdentityClient = IdentityClient;
exports.getBearerTokenFromAuthorizationHeader = getBearerTokenFromAuthorizationHeader;
//# sourceMappingURL=index.cjs.js.map
