export interface TreeRecursive {
    route: string;
    status?: string;
    name?: string;
    children?: TreeRecursive[];
}