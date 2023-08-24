/**
 * Configuration for the database connection.
 */
export interface ConfigDBData {
  type: string;
  user: string;
  pass: string;
  name: string;
  host: string;
  port: number;
  dialect: string;
  charset: string;
  collate: string;
}

/**
 * Configuration for the redis store connection.
 */

export interface ConfigRedisData {
  host: string;
  port: string;
  ttl: number;
}

/**
 * Configuration data for the app.
 */
export interface ConfigData {
  env: string;

  /** The port number of the http server to listen on. */
  port: number;

  /** Database connection details. */
  db?: ConfigDBData;

  /**
   * The log level to use.
   * @example 'verbose', 'info', 'warn', 'error'
   */
  logLevel: string;

  /** Redis Connection details */
  redis?: ConfigRedisData;
}
