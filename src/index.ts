import {Schema, Types} from "mongoose";
import {faker} from "@faker-js/faker"

export default function mstdog(paths: { [key: string]: any }) {
    const mockData: { [key: string]: any } = {};

    Object.keys(paths).forEach((key) => {
        const field = paths[key];

        if (!field) return;

        if (field instanceof Function) {
            mockData[key] = generateValueForType(field.name, field.enumValues && field.enumValues.length > 0 ? field.enumValues : undefined);
            return;
        }

        if (field instanceof Schema) {
            mockData[key] = mstdog(field.paths);
            return;
        } else if (field instanceof Schema.Types.Subdocument) {
            mockData[key] = mstdog(field.schema.paths);
            return;
        }

        if (Array.isArray(field)) {
            mockData[key] = handleArrayField(field);
            return;
        }

        if (typeof field === "object") {
            const typeField = field.type || (field.options && field.options.type);
            if (!typeField) return;

            let enumValues = field.enumValues

            if (enumValues === undefined && field.options !== undefined) {
                enumValues = field.options.enum ?? undefined;
            }

            if (Array.isArray(typeField)) {
                mockData[key] = handleArrayField(typeField, enumValues);
            } else {
                mockData[key] = generateValueForType(typeField.name || typeField, enumValues && enumValues.length > 0 ? enumValues : undefined);
            }
        }
    });

    return mockData;
}

function handleArrayField(field: any[], enumValues?: string[]) {
    if (field[0] instanceof Schema || field[0] instanceof Schema.Types.Subdocument) {
        return Array.from({ length: 3 }, () => mstdog(field[0].paths || field[0].schema.paths));
    } else if (field[0] instanceof Function) {
        return Array.from({ length: 3 }, () => generateValueForType(field[0].name, enumValues && enumValues.length > 0 ? enumValues : undefined));
    }
    return [];
}

function generateValueForType(type: string, enumValue?: string[]) {
    switch (type.toLowerCase()) {
        case 'string':
            return handleStringType(enumValue);
        case 'schemastring':
            return handleStringType(enumValue);
        case 'number':
            return handleNumberType();
        case 'schemanumber':
            return handleNumberType();
        case 'date':
            return handleDateType();
        case 'schemadate':
            return handleDateType();
        case 'boolean':
            return handleBooleanType();
        case 'schemaboolean':
            return handleBooleanType();
        case 'objectid':
            return new Types.ObjectId().toHexString();
        case 'mixed':
            return {
                a: faker.string.alphanumeric(5),
                b: faker.number.int({max: 8})
            }
        default:
            return 'Unknown Type';
    }
}

const handleStringType = (enumValue?: string[]): string => {
    if (enumValue) {
        return faker.helpers.arrayElement(enumValue)
    }
    return faker.string.alphanumeric({ length: 6})
}

const handleNumberType = (): number => {
    return faker.number.int({ max: 15 })
}

const handleDateType = (): Date => {
    return faker.date.recent()
}

const handleBooleanType = (): Boolean => {
    return faker.datatype.boolean()
}