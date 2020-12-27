export interface FileDescription {
    content: string;
    path: string;
    original: string;
}
export default abstract class MapFile {
    public static files: Map<string, FileDescription> = new Map();
}
