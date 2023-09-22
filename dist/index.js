"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const faker_1 = require("@faker-js/faker");
function mstdog(paths) {
    const mockData = {};
    Object.keys(paths).forEach((key) => {
        var _a;
        const field = paths[key];
        if (!field)
            return;
        if (field instanceof Function) {
            mockData[key] = generateValueForType(field.name, field.enumValues && field.enumValues.length > 0 ? field.enumValues : undefined);
            return;
        }
        if (field instanceof mongoose_1.Schema) {
            mockData[key] = mstdog(field.paths);
            return;
        }
        else if (field instanceof mongoose_1.Schema.Types.Subdocument) {
            mockData[key] = mstdog(field.schema.paths);
            return;
        }
        if (Array.isArray(field)) {
            mockData[key] = handleArrayField(field);
            return;
        }
        if (typeof field === "object") {
            const typeField = field.type || (field.options && field.options.type);
            if (!typeField)
                return;
            let enumValues = field.enumValues;
            if (enumValues === undefined && field.options !== undefined) {
                enumValues = (_a = field.options.enum) !== null && _a !== void 0 ? _a : undefined;
            }
            if (Array.isArray(typeField)) {
                mockData[key] = handleArrayField(typeField, enumValues);
                return;
            }
            if (typeField instanceof mongoose_1.Schema) {
                mockData[key] = mstdog(typeField.paths);
                return;
            }
            else if (typeField instanceof mongoose_1.Schema.Types.Subdocument) {
                mockData[key] = mstdog(typeField.schema.paths);
                return;
            }
            mockData[key] = generateValueForType(typeField.name || typeField, enumValues && enumValues.length > 0 ? enumValues : undefined);
            return;
        }
    });
    return mockData;
}
exports.default = mstdog;
function handleArrayField(field, enumValues) {
    if (field[0] instanceof mongoose_1.Schema || field[0] instanceof mongoose_1.Schema.Types.Subdocument) {
        return Array.from({ length: 3 }, () => mstdog(field[0].paths || field[0].schema.paths));
    }
    else if (field[0] instanceof Function) {
        return Array.from({ length: 3 }, () => generateValueForType(field[0].name, enumValues && enumValues.length > 0 ? enumValues : undefined));
    }
    return [];
}
function generateValueForType(type, enumValue) {
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
            return new mongoose_1.Types.ObjectId().toHexString();
        case 'mixed':
            return {
                a: faker_1.faker.string.alphanumeric(5),
                b: faker_1.faker.number.int({ max: 8 })
            };
        default:
            return 'Unknown Type';
    }
}
const handleStringType = (enumValue) => {
    if (enumValue) {
        return faker_1.faker.helpers.arrayElement(enumValue);
    }
    return faker_1.faker.string.alphanumeric({ length: 6 });
};
const handleNumberType = () => {
    return faker_1.faker.number.int({ max: 15 });
};
const handleDateType = () => {
    return faker_1.faker.date.recent();
};
const handleBooleanType = () => {
    return faker_1.faker.datatype.boolean();
};
//# sourceMappingURL=index.js.map