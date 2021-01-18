import { Utils } from "./Utils.ts";

interface Position {
  start: number;
  end: number;
}
interface PositionInFile {
  start: number;
  end: number;
  column: number;
  line: number;
}
export abstract class MapPosition extends Utils {
  public static mapTokens: Map<string, Position> = new Map();
  public static mapNodes: Map<any, PositionInFile> = new Map();
  static getColumn(text: string, position: Position, startIndex = 0): number {
    try {
      const array = text.split('\n');
      let i = 0;
      let currentLine = this.getLine(text, position);
      const currentColumn = array.map((line, index) => {
        const part1 = array.slice(0, index).join('\n').length;
        const result = line.slice(0, i - line.length);
        i = part1 - line.length;
        return part1 <= position.start
          ? currentLine === index + 1
            ? result
            : ''
          : '';
      });
      const result = currentColumn.find((line) => line.length)?.length || 0;
      return result - startIndex > 0 ? result - startIndex : 0;
    } catch (err) {
      this.error(`MapPosition: ${err.message}
${err.stack}`);
    }
  }
  static getLine(text: string, position: Position, startIndex = 0): number {
    try {
      const array = text.split('\n');
      const currentLine = array.find((line, index) => {
        const part1 = array.slice(0, index).join('\n').length;
        return part1 > position.start
      });
      const result = currentLine && array.indexOf(currentLine) || 0;
      return result;
    } catch (err) {
      this.error(`MapPosition: ${err.message}
${err.stack}`);
    }
  }
}