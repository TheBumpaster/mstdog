import { Schema } from "mongoose";
type MstdogOptions = {
    arrayLength?: number;
    maxDepth?: number;
    currentDepth?: number;
    handleRefs?: boolean;
    schemas?: {
        [key: string]: Schema;
    };
    customFieldGenerators?: {
        [key: string]: () => any;
    };
    typeGenerators?: {
        [type: string]: () => any;
    };
};
export default function mstdog(paths: {
    [key: string]: any;
}, options?: MstdogOptions): {
    [key: string]: any;
};
export {};
//# sourceMappingURL=index.d.ts.map