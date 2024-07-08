import { Schema, Types } from "mongoose";
import { faker } from "@faker-js/faker";

type MstdogOptions = {
    arrayLength?: number;
    maxDepth?: number;
    currentDepth?: number;
    customFieldGenerators?: {
        [key: string]: () => any;
    };
}

const defaultOptions: MstdogDefaultOptions = {
    arrayLength: 3,
    maxDepth: 5,
    currentDepth: 0,
};

type MstdogDefaultOptions =  {
    arrayLength: number;
    maxDepth: number;
    currentDepth: number;
    customFieldGenerators?: {
        [key: string]: () => any;
    };
}

export default function mstdog(paths: { [key: string]: any }, options: MstdogOptions = {}): { [key: string]: any } {
    const _options: MstdogDefaultOptions = { ...defaultOptions, ...options };
    _options.currentDepth += 1;

    if (_options.currentDepth! > _options.maxDepth!) {
        return {};
    }

    const mockData: { [key: string]: any } = {};

    Object.keys(paths).forEach((key) => {
        const field = paths[key];

        if (!field) return;

        if (_options.customFieldGenerators?.[key]) {
            mockData[key] = _options.customFieldGenerators[key]();
            return;
        }

        if (typeof field === 'function') {
            mockData[key] = generateValueForType(field.name, getEnumValues(field));
            return;
        }

        if (field instanceof Schema) {
            mockData[key] = mstdog(field.paths, _options);
            return;
        } else if (field instanceof Schema.Types.Subdocument) {
            mockData[key] = mstdog(field.schema.paths, _options);
            return;
        }

        if (Array.isArray(field)) {
            mockData[key] = handleArrayField(field, _options);
            return;
        }

        if (typeof field === "object") {
            const typeField = field.type || (field.options && field.options.type);
            if (!typeField) return;

            let enumValues = getEnumValues(field);

            if (Array.isArray(typeField)) {
                mockData[key] = handleArrayField(typeField, _options, enumValues);
                return;
            }

            if (typeField instanceof Schema) {
                mockData[key] = mstdog(typeField.paths, _options);
                return;
            } else if (typeField instanceof Schema.Types.Subdocument) {
                mockData[key] = mstdog(typeField.schema.paths, _options);
                return;
            } else if (typeField instanceof Schema.Types.DocumentArray) {
                mockData[key] = Array.from({ length: _options.arrayLength }, () => mstdog(typeField.schema.paths, _options));
                return;
            }

            mockData[key] = generateValueForType(typeField.name || typeField, enumValues);
            return;
        }
    });

    return mockData;
}

function handleArrayField(field: any[], options: MstdogDefaultOptions, enumValues?: string[]) {
    if (field[0] instanceof Schema || field[0] instanceof Schema.Types.Subdocument || field[0] instanceof Schema.Types.DocumentArray) {
        return Array.from({ length: options.arrayLength }, () => mstdog(field[0].paths || field[0].schema.paths, options));
    } else if (typeof field[0] === 'function' || (field[0] && typeof field[0].type === 'function')) {
        const fieldType = typeof field[0] === 'function' ? field[0] : field[0].type;
        return Array.from({ length: options.arrayLength }, () => generateValueForType(fieldType.name, enumValues));
    }
    return [];
}

function generateValueForType(type: string, enumValue?: string[]) {
    switch (type.toLowerCase()) {
        case 'string':
        case 'schemastring':
            return handleStringType(enumValue);
        case 'number':
        case 'schemanumber':
            return handleNumberType();
        case 'date':
        case 'schemadate':
            return handleDateType();
        case 'boolean':
        case 'schemaboolean':
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

function handleStringType(enumValue?: string[]): string {
    if (enumValue && enumValue.length > 0) {
        return faker.helpers.arrayElement(enumValue);
    }
    return faker.string.alphanumeric({ length: 6 });
}

function handleNumberType(): number {
    return faker.number.int({ max: 15 });
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
