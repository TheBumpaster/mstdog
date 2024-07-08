"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const randexp_1 = __importDefault(require("randexp"));
const mongoose_1 = require("mongoose");
const faker_1 = require("@faker-js/faker");
const defaultOptions = {
    arrayLength: 3,
    maxDepth: 5,
    currentDepth: 0,
    handleRefs: false
};
function sortFieldsByDependencies(paths, dependencies, schemaKey = "root") {
    const schemaDependencies = dependencies[schemaKey] || {};
    if (Object.keys(schemaDependencies).length === 0) {
        return Object.keys(paths);
    }
    let sortedFields = [];
    let resolved = new Set();
    let visiting = new Set();
    function visit(field, stack = []) {
        if (resolved.has(field))
            return;
        if (visiting.has(field)) {
            console.error(`Cyclic dependency detected: ${field} depends on itself via ${stack.join(' -> ')}`);
            throw new Error(`Cyclic dependency detected: ${field} depends on itself`);
        }
        visiting.add(field);
        stack.push(field);
        (schemaDependencies[field] || []).forEach(dep => {
            if (!paths[dep] && !schemaDependencies[dep]) {
                console.warn(`Dependency '${dep}' for field '${field}' is not defined in paths or dependencies.`);
            }
            else {
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
function mstdog(paths, options = {}, schemaKey = "root") {
    const _options = Object.assign(Object.assign({}, defaultOptions), options);
    _options.currentDepth += 1;
    if (_options.currentDepth > _options.maxDepth) {
        return {};
    }
    const mockData = {};
    const fieldOrder = sortFieldsByDependencies(paths, _options.typeGeneratorDependencies || {}, schemaKey);
    fieldOrder.forEach(key => {
        var _a, _b, _c, _d;
        const field = paths[key];
        if (!field)
            return;
        if ((_a = _options.customFieldGenerators) === null || _a === void 0 ? void 0 : _a[key]) {
            mockData[key] = _options.customFieldGenerators[key]();
            return;
        }
        const fieldOptions = {
            fieldName: key,
            enumValues: getEnumValues(field)
        };
        let refSchemaName = typeof ((_b = field.options) === null || _b === void 0 ? void 0 : _b.ref) === 'function' ? (_c = field.options) === null || _c === void 0 ? void 0 : _c.ref() : (_d = field.options) === null || _d === void 0 ? void 0 : _d.ref;
        if (refSchemaName && _options.handleRefs && _options.schemas && _options.schemas[refSchemaName]) {
            mockData[key] = mstdog(_options.schemas[refSchemaName].paths, Object.assign(Object.assign({}, _options), { currentDepth: 0 }), key);
            return;
        }
        let value;
        if (field instanceof mongoose_1.Schema) {
            value = mstdog(field.paths, Object.assign(Object.assign({}, _options), { currentDepth: _options.currentDepth }), key);
        }
        else if (field instanceof mongoose_1.Schema.Types.Subdocument) {
            value = mstdog(field.schema.paths, Object.assign(Object.assign({}, _options), { currentDepth: _options.currentDepth }), key);
        }
        else if (field instanceof mongoose_1.Schema.Types.DocumentArray) {
            value = Array.from({ length: _options.arrayLength }, () => mstdog(field.schema.paths, Object.assign(Object.assign({}, _options), { currentDepth: _options.currentDepth }), key));
        }
        else if (Array.isArray(field)) {
            value = handleArrayField(field, _options, fieldOptions, mockData);
        }
        else if (typeof field === 'function') {
            value = generateValueForType(field.name, _options, fieldOptions, mockData);
        }
        else if (typeof field === 'object') {
            const typeField = field.type || (field.options && field.options.type);
            if (!typeField)
                return;
            if (Array.isArray(typeField)) {
                value = handleArrayField(typeField, _options, fieldOptions, mockData);
            }
            else if (typeField instanceof mongoose_1.Schema) {
                value = mstdog(typeField.paths, Object.assign(Object.assign({}, _options), { currentDepth: _options.currentDepth }), key);
            }
            else if (typeField instanceof mongoose_1.Schema.Types.Subdocument) {
                value = mstdog(typeField.schema.paths, Object.assign(Object.assign({}, _options), { currentDepth: _options.currentDepth }), key);
            }
            else if (typeField instanceof mongoose_1.Schema.Types.DocumentArray) {
                value = Array.from({ length: _options.arrayLength }, () => mstdog(typeField.schema.paths, _options));
            }
            else {
                value = generateValueForType(typeField.name || typeField, _options, fieldOptions, mockData);
            }
        }
        mockData[key] = value;
    });
    return mockData;
}
exports.default = mstdog;
function handleArrayField(field, options, fieldOptions, mockData) {
    if (field[0] instanceof mongoose_1.Schema || field[0] instanceof mongoose_1.Schema.Types.Subdocument || field[0] instanceof mongoose_1.Schema.Types.DocumentArray) {
        return Array.from({ length: options.arrayLength }, () => mstdog(field[0].paths || field[0].schema.paths, options, "root"));
    }
    else if (typeof field[0] === 'function' || (field[0] && typeof field[0].type === 'function')) {
        const fieldType = typeof field[0] === 'function' ? field[0] : field[0].type;
        return Array.from({ length: options.arrayLength }, () => generateValueForType(fieldType.name, options, fieldOptions, mockData));
    }
    return [];
}
function generateValueForType(type, options, fieldOptions, mockData) {
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
function handleStringType(options) {
    const { enumValues, minLength, maxLength, match } = options;
    if (enumValues && enumValues.length > 0) {
        return faker_1.faker.helpers.arrayElement(enumValues);
    }
    if (match) {
        const randexp = new randexp_1.default(match);
        randexp.max = maxLength || 10;
        return randexp.gen();
    }
    const length = maxLength ? faker_1.faker.number.int({ min: minLength || 1, max: maxLength }) : (minLength || 5);
    return faker_1.faker.string.alphanumeric(length);
}
function handleNumberType(fieldOptions) {
    var _a, _b;
    const min = (_a = fieldOptions.min) !== null && _a !== void 0 ? _a : 1;
    const max = (_b = fieldOptions.max) !== null && _b !== void 0 ? _b : 15;
    return faker_1.faker.number.int({ min, max });
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