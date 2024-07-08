"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const faker_1 = require("@faker-js/faker");
const defaultOptions = {
    arrayLength: 3,
    maxDepth: 5,
    currentDepth: 0,
    handleRefs: false
};
function mstdog(paths, options = {}) {
    const _options = Object.assign(Object.assign({}, defaultOptions), options);
    _options.currentDepth += 1;
    if (_options.currentDepth > _options.maxDepth) {
        return {};
    }
    const mockData = {};
    Object.keys(paths).forEach((key) => {
        var _a, _b, _c, _d;
        const field = paths[key];
        if (!field)
            return;
        if ((_a = _options.customFieldGenerators) === null || _a === void 0 ? void 0 : _a[key]) {
            mockData[key] = _options.customFieldGenerators[key]();
            return;
        }
        let refSchemaName = typeof ((_b = field.options) === null || _b === void 0 ? void 0 : _b.ref) === 'function' ? (_c = field.options) === null || _c === void 0 ? void 0 : _c.ref() : (_d = field.options) === null || _d === void 0 ? void 0 : _d.ref;
        if (refSchemaName && _options.handleRefs && _options.schemas && _options.schemas[refSchemaName]) {
            mockData[key] = mstdog(_options.schemas[refSchemaName].paths, Object.assign(Object.assign({}, _options), { currentDepth: 0 }));
            return;
        }
        if (typeof field === 'function') {
            mockData[key] = generateValueForType(field.name, _options, getEnumValues(field));
            return;
        }
        if (field instanceof mongoose_1.Schema) {
            mockData[key] = mstdog(field.paths, _options);
            return;
        }
        else if (field instanceof mongoose_1.Schema.Types.Subdocument) {
            mockData[key] = mstdog(field.schema.paths, _options);
            return;
        }
        if (Array.isArray(field)) {
            mockData[key] = handleArrayField(field, _options);
            return;
        }
        if (typeof field === "object") {
            const typeField = field.type || (field.options && field.options.type);
            if (!typeField)
                return;
            let enumValues = getEnumValues(field);
            if (Array.isArray(typeField)) {
                mockData[key] = handleArrayField(typeField, _options, enumValues);
                return;
            }
            if (typeField instanceof mongoose_1.Schema) {
                mockData[key] = mstdog(typeField.paths, _options);
                return;
            }
            else if (typeField instanceof mongoose_1.Schema.Types.Subdocument) {
                mockData[key] = mstdog(typeField.schema.paths, _options);
                return;
            }
            else if (typeField instanceof mongoose_1.Schema.Types.DocumentArray) {
                mockData[key] = Array.from({ length: _options.arrayLength }, () => mstdog(typeField.schema.paths, _options));
                return;
            }
            mockData[key] = generateValueForType(typeField.name || typeField, _options, enumValues);
            return;
        }
    });
    return mockData;
}
exports.default = mstdog;
function handleArrayField(field, options, enumValues) {
    if (field[0] instanceof mongoose_1.Schema || field[0] instanceof mongoose_1.Schema.Types.Subdocument || field[0] instanceof mongoose_1.Schema.Types.DocumentArray) {
        return Array.from({ length: options.arrayLength }, () => mstdog(field[0].paths || field[0].schema.paths, options));
    }
    else if (typeof field[0] === 'function' || (field[0] && typeof field[0].type === 'function')) {
        const fieldType = typeof field[0] === 'function' ? field[0] : field[0].type;
        return Array.from({ length: options.arrayLength }, () => generateValueForType(fieldType.name, options, enumValues));
    }
    return [];
}
function generateValueForType(type, options, enumValue) {
    // Normalize type for consistent generator lookup
    const normalizedType = type.toLowerCase().replace('schema', '');
    // Check for a custom type generator before handling with default methods
    if (options.typeGenerators && options.typeGenerators[normalizedType]) {
        return options.typeGenerators[normalizedType]();
    }
    switch (normalizedType) {
        case 'string':
            return handleStringType(enumValue);
        case 'number':
            return handleNumberType();
        case 'date':
            return handleDateType();
        case 'boolean':
            return handleBooleanType();
        case 'objectid':
            return new mongoose_1.Types.ObjectId().toHexString();
        case 'mixed':
            return {
                a: faker_1.faker.string.alphanumeric(5),
                b: faker_1.faker.number.int({ max: 8 })
            };
        default:
            console.warn(`Unknown type: ${type}`);
            return 'Unknown Type';
    }
}
function handleStringType(enumValue) {
    if (enumValue && enumValue.length > 0) {
        return faker_1.faker.helpers.arrayElement(enumValue);
    }
    return faker_1.faker.string.alphanumeric({ length: 6 });
}
function handleNumberType() {
    return faker_1.faker.number.int({ max: 15 });
}
function handleDateType() {
    return faker_1.faker.date.recent();
}
function handleBooleanType() {
    return faker_1.faker.datatype.boolean();
}
function getEnumValues(field) {
    var _a, _b, _c;
    return (_c = (_a = field.enumValues) !== null && _a !== void 0 ? _a : (_b = field.options) === null || _b === void 0 ? void 0 : _b.enum) !== null && _c !== void 0 ? _c : undefined;
}
//# sourceMappingURL=index.js.map