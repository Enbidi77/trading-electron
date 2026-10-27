export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export class Logger implements ILogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  public debug(message: string, ...args: any[]): void {
    console.debug(`[${new Date().toISOString()}] [DEBUG] [${this.context}]:`, message, ...args);
  }

  public info(message: string, ...args: any[]): void {
    console.info(`[${new Date().toISOString()}] [INFO] [${this.context}]:`, message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(`[${new Date().toISOString()}] [WARN] [${this.context}]:`, message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    console.error(`[${new Date().toISOString()}] [ERROR] [${this.context}]:`, message, ...args);
  }
}

export function createLogger(context: string): ILogger {
  return new Logger(context);
}
