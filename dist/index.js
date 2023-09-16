"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mstdog = void 0;
const mongoose_1 = require("mongoose");
const faker_1 = require("@faker-js/faker");
function mstdog(paths) {
    const mockData = {};
    Object.keys(paths).forEach((key) => {
        var _a;
        const field = paths[key];
        let fieldType;
        if (field === undefined) {
            return;
        }
        if (field instanceof Function) {
            fieldType = field.name;
            mockData[key] = generateValueForType(fieldType);
            return;
        }
        if (field instanceof mongoose_1.Schema) {
            mockData[key] = mstdog(field.paths);
            return;
        }
        if (typeof field === "object" && field.type) {
            if (Array.isArray(field.type)) {
                if (field.type[0] instanceof mongoose_1.Schema) {
                    mockData[key] = Array.from({ length: 3 }, () => mstdog(field.type[0].paths));
                    return;
                }
                else if (field.type[0] instanceof Function) {
                    mockData[key] = Array.from({ length: 3 }, () => generateValueForType(field.type[0].name));
                    return;
                }
            }
            else {
                fieldType = field.type.name;
                mockData[key] = generateValueForType(fieldType);
                return;
            }
        }
        if (typeof field === "object" && field.options) {
            if (Array.isArray(field)) {
                if (field[0] instanceof mongoose_1.Schema || field[0] instanceof mongoose_1.Schema.Types.Subdocument) {
                    mockData[key] = Array.from({ length: 3 }, () => mstdog(field[0].paths));
                    return;
                }
                else if (field[0] instanceof Function) {
                    mockData[key] = Array.from({ length: 3 }, () => generateValueForType(field[0].name));
                    return;
                }
            }
            if (field instanceof mongoose_1.Schema.Types.Subdocument) {
                mockData[key] = mstdog(field.schema.paths);
                return;
            }
            else {
                if (Array.isArray(field.options.type)) {
                    if (field.options.type[0] instanceof mongoose_1.Schema || field.options.type[0] instanceof mongoose_1.Schema.Types.Subdocument) {
                        mockData[key] = Array.from({ length: 3 }, () => mstdog(field.options.type[0].paths));
                        return;
                    }
                    else if (field.options.type[0] instanceof Function) {
                        mockData[key] = Array.from({ length: 3 }, () => generateValueForType(field.options.type[0].name));
                        return;
                    }
                }
                fieldType = (_a = field.options.type.name) !== null && _a !== void 0 ? _a : field.options.type;
                mockData[key] = generateValueForType(fieldType);
                return;
            }
        }
        if (Array.isArray(field)) {
            if (field[0] instanceof mongoose_1.Schema) {
                mockData[key] = Array.from({ length: 3 }, () => mstdog(field[0].paths));
                return;
            }
            else if (field[0] instanceof Function) {
                mockData[key] = Array.from({ length: 3 }, () => generateValueForType(field[0].name));
                return;
            }
        }
    });
    return mockData;
}
exports.mstdog = mstdog;
function generateValueForType(type) {
    console.log(type);
    switch (type) {
        case 'String':
            return faker_1.faker.string.alphanumeric({ length: 6 });
        case 'Number':
            return faker_1.faker.number.int({ max: 15 });
        case 'Date':
            return faker_1.faker.date.recent();
        case 'Boolean':
            return faker_1.faker.datatype.boolean();
        case 'ObjectId':
            return new mongoose_1.Types.ObjectId().toHexString();
        case 'Mixed':
            return {
                a: faker_1.faker.string.alphanumeric(5),
                b: faker_1.faker.number.int({ max: 8 })
            };
        default:
            return 'Unknown Type';
    }
}
// Embedded subdocument
const AddressSchema = new mongoose_1.Schema({
    street: String,
    city: String,
    state: String,
    zip: Number
});
// Another embedded subdocument for demonstration
const EducationSchema = new mongoose_1.Schema({
    schoolName: String,
    degree: String,
    graduationYear: Date
});
const UserSchema = new mongoose_1.Schema({
    name: String,
    age: Number,
    isActive: Boolean,
    birthdate: Date,
    bio: {
        type: String,
        text: true // Text type
    },
    address: AddressSchema,
    education: [EducationSchema],
    hobbies: [String],
    scores: [Number],
    joined: {
        type: Date,
        default: Date.now // Date with default value
    },
    email: {
        type: String,
        required: true,
        unique: true // Unique field
    },
    password: {
        type: String,
        minlength: 5,
        maxlength: 100
    },
    accountStatus: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active'
    },
    roles: {
        type: [String],
        enum: ['User', 'Admin', 'Moderator'] // Array of enumerated values
    },
    customData: mongoose_1.Schema.Types.Mixed,
    _someId: mongoose_1.Schema.Types.ObjectId // ObjectId type
});
const mockData = mstdog(UserSchema.paths);
console.log(mockData);
//# sourceMappingURL=index.js.map