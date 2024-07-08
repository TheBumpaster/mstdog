import RandExp from "randexp";
import { Schema, Types } from "mongoose";
import { faker } from "@faker-js/faker";

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
    schemas?: { [key: string]: Schema };
    customFieldGenerators?: CustomFieldGenerators;
    typeGenerators?: CustomTypeGenerators<D>;
    typeGeneratorDependencies?: DependencyMap
};

const defaultOptions: MstdogDefaultOptions = {
    arrayLength: 3,
    maxDepth: 5,
    currentDepth: 0,
    handleRefs: false
};

type MstdogDefaultOptions = {
    arrayLength: number;
    maxDepth: number;
    currentDepth: number;
    handleRefs: boolean;
    schemas?: { [key: string]: Schema };
    customFieldGenerators?: CustomFieldGenerators;
    typeGenerators?: CustomTypeGenerators<any>;
    typeGeneratorDependencies?: DependencyMap
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
        [property: string]: string[]
    }
}

function sortFieldsByDependencies(paths: { [key: string]: any }, dependencies: DependencyMap, schemaKey: string = "root"): string[] {
    const schemaDependencies = dependencies[schemaKey] || {};
    
    if (Object.keys(schemaDependencies).length === 0) {
        return Object.keys(paths);
    }

    let sortedFields: string[] = [];
    let resolved = new Set<string>();
    let visiting = new Set<string>();

    function visit(field: string, stack: string[] = []) {
        if (resolved.has(field)) return;
        if (visiting.has(field)) {
            console.error(`Cyclic dependency detected: ${field} depends on itself via ${stack.join(' -> ')}`);
            throw new Error(`Cyclic dependency detected: ${field} depends on itself`);
        }

        visiting.add(field);
        stack.push(field);

        (schemaDependencies[field] || []).forEach(dep => {
            if (!paths[dep] && !schemaDependencies[dep]) {
                console.warn(`Dependency '${dep}' for field '${field}' is not defined in paths or dependencies.`);
            } else {
                visit(dep, stack.slice());
            }
        });

        visiting.delete(field);
        resolved.add(field);
        sortedFields.push(field);
    }

    Object.keys(paths).forEach(field => {
        if (!resolved.has(field)) {
            visit(field);
        }
    });

    return sortedFields;
}

export default function mstdog<D>(paths: { [key: string]: any }, options: MstdogOptions<D> = {}, schemaKey: string = "root"): { [key: string]: any } {
    const _options: MstdogDefaultOptions = { ...defaultOptions, ...options };
    _options.currentDepth += 1;

    if (_options.currentDepth > _options.maxDepth) {
        return {};
    }

    const mockData: { [key: string]: any } = {};

    const fieldOrder = sortFieldsByDependencies(paths, _options.typeGeneratorDependencies || {}, schemaKey);

    fieldOrder.forEach(key => {
        const field = paths[key];
        if (!field) return;

        if (_options.customFieldGenerators?.[key]) {
            mockData[key] = _options.customFieldGenerators[key]();
            return;
        }

        const fieldOptions: FieldOptions = {
            fieldName: key,
            enumValues: getEnumValues(field)
        };

        let refSchemaName = typeof field.options?.ref === 'function' ? field.options?.ref() : field.options?.ref;

        if (refSchemaName && _options.handleRefs && _options.schemas && _options.schemas[refSchemaName]) {
            mockData[key] = mstdog(_options.schemas[refSchemaName].paths, {..._options, currentDepth: 0}, key);
            return;
        }

        let value;
        if (field instanceof Schema) {
            value = mstdog(field.paths, { ..._options, currentDepth: _options.currentDepth }, key);
        } else if (field instanceof Schema.Types.Subdocument) {
            value = mstdog(field.schema.paths, { ..._options, currentDepth: _options.currentDepth }, key);
        } else if (field instanceof Schema.Types.DocumentArray) {
            value = Array.from({ length: _options.arrayLength }, () => mstdog(field.schema.paths, { ..._options, currentDepth: _options.currentDepth }, key));
        } else if (Array.isArray(field)) {
            value = handleArrayField(field, _options, fieldOptions, mockData);
        } else if (typeof field === 'function') {
            value = generateValueForType(field.name, _options, fieldOptions, mockData);
        } else if (typeof field === 'object') {
            const typeField = field.type || (field.options && field.options.type);
            if (!typeField) return;
            if (Array.isArray(typeField)) {
                value = handleArrayField(typeField, _options, fieldOptions, mockData);
            } else if (typeField instanceof Schema) {
                value = mstdog(typeField.paths, { ..._options, currentDepth: _options.currentDepth }, key);
            } else if (typeField instanceof Schema.Types.Subdocument) {
                value = mstdog(typeField.schema.paths, { ..._options, currentDepth: _options.currentDepth }, key);
            } else if (typeField instanceof Schema.Types.DocumentArray) {
                value = Array.from({ length: _options.arrayLength }, () => mstdog(typeField.schema.paths, _options));
            } else {
                value = generateValueForType(typeField.name || typeField, _options, fieldOptions, mockData);
            }
        }

        mockData[key] = value;
    });

    return mockData;
}

function handleArrayField(field: any[], options: MstdogDefaultOptions, fieldOptions: FieldOptions, mockData: any) {
    if (field[0] instanceof Schema || field[0] instanceof Schema.Types.Subdocument || field[0] instanceof Schema.Types.DocumentArray) {
        return Array.from({ length: options.arrayLength }, () => mstdog(field[0].paths || field[0].schema.paths, options, "root"));
    } else if (typeof field[0] === 'function' || (field[0] && typeof field[0].type === 'function')) {
        const fieldType = typeof field[0] === 'function' ? field[0] : field[0].type;
        return Array.from({ length: options.arrayLength }, () => generateValueForType(fieldType.name, options, fieldOptions, mockData));
    }
    return [];
}

function generateValueForType(type: string | Function, options: MstdogOptions<any>, fieldOptions: FieldOptions, mockData: any) {
    const normalizedType = typeof type === 'string' ? type.toLowerCase().replace('schema', '') : type.name.toLowerCase();

    if (options.typeGenerators && options.typeGenerators[normalizedType]) {
        return options.typeGenerators[normalizedType](mockData, fieldOptions);
    }

    switch (normalizedType) {
        case 'string':
            return handleStringType(fieldOptions);
        case 'number':
            return handleNumberType(fieldOptions);
        case 'date':
            return handleDateType();
        case 'boolean':
            return handleBooleanType();
        case 'objectid':
            return new Types.ObjectId().toHexString();
        case 'mixed':
            return {
                a: faker.string.alphanumeric(5),
                b: faker.number.int({ max: 8 })
            };
        default:
            console.warn(`Unknown type: ${type}`);
            return 'Unknown Type';
    }
}

function handleStringType(options: FieldOptions): string {
    const { enumValues, minLength, maxLength, match } = options;
    if (enumValues && enumValues.length > 0) {
        return faker.helpers.arrayElement(enumValues);
    }

    if (match) {
        const randexp = new RandExp(match);
        randexp.max = maxLength || 10;
        return randexp.gen();
    }

    const length = maxLength ? faker.number.int({ min: minLength || 1, max: maxLength }) : (minLength || 5);
    return faker.string.alphanumeric(length);
}

function handleNumberType(fieldOptions: FieldOptions): number {
    const min = fieldOptions.min ?? 1;
    const max = fieldOptions.max ?? 15;
    return faker.number.int({ min, max });
}

function handleDateType(): Date {
    return faker.date.recent();
}

function handleBooleanType(): boolean {
    return faker.datatype.boolean();
}

function getEnumValues(field: any): string[] | undefined {
    return field.enumValues ?? field.options?.enum ?? undefined;
}
