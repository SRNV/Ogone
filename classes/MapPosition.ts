interface Position {
  start: number;
  end: number;
}
export abstract class MapPosition {
  public static mapTokens: Map<MapPosition, Position> = new Map();
  public static mapNodes: Map<MapPosition, Position> = new Map();
}