declare module "node:sqlite" {
  export type StatementResult = {
    changes: number;
    lastInsertRowid: number | bigint;
  };

  export class StatementSync {
    all(...params: unknown[]): Array<Record<string, unknown>>;
    get(...params: unknown[]): Record<string, unknown> | undefined;
    run(...params: unknown[]): StatementResult;
  }

  export class DatabaseSync {
    constructor(location: string);
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
