import {Schema, Types} from "mongoose";
import {faker} from "@faker-js/faker"

export function mstdog(paths: { [key: string]: any }) {
    const mockData: { [key: string]: any } = {};

    Object.keys(paths).forEach((key) => {
        const field = paths[key];

        if (!field) return;

        if (field instanceof Function) {
            mockData[key] = generateValueForType(field.name);
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

            if (Array.isArray(typeField)) {
                mockData[key] = handleArrayField(typeField);
            } else {
                mockData[key] = generateValueForType(typeField.name || typeField);
            }
        }
    });

    return mockData;
}

function handleArrayField(field: any[]) {
    if (field[0] instanceof Schema || field[0] instanceof Schema.Types.Subdocument) {
        return Array.from({ length: 3 }, () => mstdog(field[0].paths || field[0].schema.paths));
    } else if (field[0] instanceof Function) {
        return Array.from({ length: 3 }, () => generateValueForType(field[0].name));
    }
    return [];
}

function generateValueForType(type: any) {
    switch (type) {
        case 'String':
            return faker.string.alphanumeric({ length: 6})
        case 'Number':
            return faker.number.int({ max: 15 })
        case 'Date':
            return faker.date.recent()
        case 'Boolean':
            return faker.datatype.boolean()
        case 'ObjectId':
            return new Types.ObjectId().toHexString();
        case 'Mixed':
            return {
                a: faker.string.alphanumeric(5),
                b: faker.number.int({max: 8})
            }
        default:
            return 'Unknown Type';
    }
}
