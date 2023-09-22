"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
const mongoose_1 = __importStar(require("mongoose"));
const Schema = mongoose_1.default.Schema;
describe('MSTDOG', () => {
    it('should generate mock data for a simple schema', () => {
        const TestSchema = new Schema({
            name: String,
            age: Number,
            isActive: Boolean,
            birthdate: Date
        });
        const mockData = (0, index_1.default)(TestSchema.paths);
        // Check if the generated mock data has the expected fields
        expect(mockData).toHaveProperty('name');
        expect(typeof mockData.name).toBe('string');
        expect(mockData).toHaveProperty('age');
        expect(typeof mockData.age).toBe('number');
        expect(mockData).toHaveProperty('isActive');
        expect(typeof mockData.isActive).toBe('boolean');
        expect(mockData).toHaveProperty('birthdate');
        expect(mockData.birthdate).toBeInstanceOf(Date);
    });
    it('should generate mock data for an abstract schema', () => {
        const TestSchema = new Schema({
            name: {
                type: 'string'
            },
            age: {
                type: 'number'
            },
            isActive: {
                type: 'boolean'
            },
            birthdate: {
                type: 'date'
            }
        });
        const mockData = (0, index_1.default)(TestSchema.paths);
        // Check if the generated mock data has the expected fields
        expect(mockData).toHaveProperty('name');
        expect(typeof mockData.name).toBe('string');
        expect(mockData).toHaveProperty('age');
        expect(typeof mockData.age).toBe('number');
        expect(mockData).toHaveProperty('isActive');
        expect(typeof mockData.isActive).toBe('boolean');
        expect(mockData).toHaveProperty('birthdate');
        expect(mockData.birthdate).toBeInstanceOf(Date);
    });
    it('should generate mock data for an schema consuming mongoose schema types', () => {
        const TestSchema = new Schema({
            name: {
                type: mongoose_1.SchemaTypes.String
            },
            age: {
                type: mongoose_1.SchemaTypes.Number
            },
            isActive: {
                type: mongoose_1.SchemaTypes.Boolean
            },
            birthdate: {
                type: mongoose_1.SchemaTypes.Date
            }
        });
        const mockData = (0, index_1.default)(TestSchema.paths);
        // Check if the generated mock data has the expected fields
        expect(mockData).toHaveProperty('name');
        expect(typeof mockData.name).toBe('string');
        expect(mockData).toHaveProperty('age');
        expect(typeof mockData.age).toBe('number');
        expect(mockData).toHaveProperty('isActive');
        expect(typeof mockData.isActive).toBe('boolean');
        expect(mockData).toHaveProperty('birthdate');
        expect(mockData.birthdate).toBeInstanceOf(Date);
    });
    it('should generate mock data for a complex User schema', () => {
        // Embedded subdocument
        const AddressSchema = new Schema({
            street: String,
            city: String,
            state: String,
            zip: Number
        });
        // Another embedded subdocument for demonstration
        const EducationSchema = new Schema({
            schoolName: String,
            degree: String,
            graduationYear: Date
        });
        const UserSchema = new Schema({
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
            customData: Schema.Types.Mixed,
            _someId: Schema.Types.ObjectId // ObjectId type
        });
        const mockData = (0, index_1.default)(UserSchema.paths);
        // Check if the generated mock data has the expected fields
        expect(mockData).toHaveProperty('name');
        expect(typeof mockData.name).toBe('string');
        expect(mockData).toHaveProperty('age');
        expect(typeof mockData.age).toBe('number');
        expect(mockData).toHaveProperty('isActive');
        expect(typeof mockData.isActive).toBe('boolean');
        expect(mockData).toHaveProperty('birthdate');
        expect(mockData.birthdate).toBeInstanceOf(Date);
        expect(mockData).toHaveProperty('bio');
        expect(typeof mockData.bio).toBe('string');
        expect(mockData).toHaveProperty('address');
        expect(typeof mockData.address.street).toBe('string');
        expect(typeof mockData.address.city).toBe('string');
        expect(typeof mockData.address.state).toBe('string');
        expect(typeof mockData.address.zip).toBe('number');
        expect(mockData).toHaveProperty('education');
        expect(Array.isArray(mockData.education)).toBe(true);
        expect(mockData.education[0]).toHaveProperty('schoolName');
        expect(mockData.education[0]).toHaveProperty('degree');
        expect(mockData.education[0].graduationYear).toBeInstanceOf(Date);
        expect(mockData).toHaveProperty('hobbies');
        expect(Array.isArray(mockData.hobbies)).toBe(true);
        expect(typeof mockData.hobbies[0]).toBe('string');
        expect(mockData).toHaveProperty('scores');
        expect(Array.isArray(mockData.scores)).toBe(true);
        expect(typeof mockData.scores[0]).toBe('number');
        expect(mockData).toHaveProperty('joined');
        expect(mockData.joined).toBeInstanceOf(Date);
        expect(mockData).toHaveProperty('email');
        expect(typeof mockData.email).toBe('string');
        expect(mockData).toHaveProperty('password');
        expect(typeof mockData.password).toBe('string');
        expect(mockData).toHaveProperty('accountStatus');
        expect(['Active', 'Inactive', 'Suspended']).toContain(mockData.accountStatus);
        expect(mockData).toHaveProperty('roles');
        expect(Array.isArray(mockData.roles)).toBe(true);
        expect(['User', 'Admin', 'Moderator']).toContain(mockData.roles[0]);
        expect(mockData).toHaveProperty('customData');
        expect(mockData).toHaveProperty('_someId');
        expect(typeof mockData._someId).toBe('string');
    });
});
//# sourceMappingURL=probe.test.js.map