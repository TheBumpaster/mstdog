type MstdogOptions = {
    arrayLength?: number;
    maxDepth?: number;
    currentDepth?: number;
    customFieldGenerators?: {
        [key: string]: () => any;
    };
};
export default function mstdog(paths: {
    [key: string]: any;
}, options?: MstdogOptions): {
    [key: string]: any;
};
export {};
//# sourceMappingURL=index.d.ts.map