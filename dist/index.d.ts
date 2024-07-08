import { Schema } from "mongoose";
type CustomFieldGenerators = {
    [key: string]: () => any;
};
type CustomTypeGenerators<D> = {
    [type: string]: (mockData: D, options?: FieldOptions) => any;
};
export type MstdogOptions<D> = {
    arrayLength?: number;
    maxDepth?: number;
    currentDepth?: number;
    handleRefs?: boolean;
    schemas?: {
        [key: string]: Schema;
    };
    customFieldGenerators?: CustomFieldGenerators;
    typeGenerators?: CustomTypeGenerators<D>;
    typeGeneratorDependencies?: DependencyMap;
};
export type FieldOptions = {
    fieldName: string;
    enumValues?: string[];
    minLength?: number;
    maxLength?: number;
    match?: RegExp;
    min?: number;
    max?: number;
};
type DependencyMap = {
    [key: string]: {
        [property: string]: string[];
    };
};
export default function mstdog<D>(paths: {
    [key: string]: any;
}, options?: MstdogOptions<D>, schemaKey?: string): {
    [key: string]: any;
};
export {};
//# sourceMappingURL=index.d.ts.map