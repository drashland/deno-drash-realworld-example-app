enum Format {
  TEXT = 0,
  BINARY = 1,
}

class Column {
  constructor(
      public name: string,
      public tableOid: number,
      public index: number,
      public typeOid: number,
      public columnLength: number,
      public typeModifier: number,
      public format: Format,
  ) {}
}

class RowDescription {
  constructor(public columnCount: number, public columns: Column[]) {}
}

type CommandType = (
    | "INSERT"
    | "DELETE"
    | "UPDATE"
    | "SELECT"
    | "MOVE"
    | "FETCH"
    | "COPY"
    );

export interface IQueryResult {
  rowDescription: RowDescription;
  _done: boolean;
  // deno-lint-ignore no-explicit-any
  rows: any[];
  rowCount?: number;
  command: CommandType;
}