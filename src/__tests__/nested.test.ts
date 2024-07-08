import mstdog from '../index';
import { Schema, Types } from "mongoose";

describe('mstdog', () => {
    it('should generate dummy data for a simple schema', () => {
        const schema = new Schema({
            name: { type: String },
            age: { type: Number }
        });

        const result = mstdog(schema.paths);
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('age');
        expect(typeof result.name).toBe('string');
        expect(typeof result.age).toBe('number');
    });

    it('should generate dummy data for nested schema', () => {
        const nestedSchema = new Schema({
            address: { type: new Schema({
                street: { type: String },
                city: { type: String }
            }) }
        });

        const result = mstdog(nestedSchema.paths);
        expect(result).toHaveProperty('address');
        expect(result.address).toHaveProperty('street');
        expect(result.address).toHaveProperty('city');
        expect(typeof result.address.street).toBe('string');
        expect(typeof result.address.city).toBe('string');
    });

    it('should handle array fields correctly', () => {
        const arraySchema = new Schema({
            tags: [String]
        });

        const result = mstdog(arraySchema.paths);
        expect(result).toHaveProperty('tags');
        expect(Array.isArray(result.tags)).toBe(true);
        expect(result.tags.length).toBe(3); // Default array length
        result.tags.forEach((tag: unknown) => {
            expect(typeof tag).toBe('string');
        });
    });

    it('should handle array fields defined with objects correctly', () => {
        const arraySchema = new Schema({
            tags: [{ type: String }]
        });

        const result = mstdog(arraySchema.paths);
        expect(result).toHaveProperty('tags');
        expect(Array.isArray(result.tags)).toBe(true);
        expect(result.tags.length).toBe(3); // Default array length
        result.tags.forEach((tag: unknown) => {
            expect(typeof tag).toBe('string');
        });
    });

    it('should use custom field generators', () => {
        const customSchema = new Schema({
            customField: { type: String }
        });

        const customOptions = {
            customFieldGenerators: {
                customField: () => 'Custom Value'
            }
        };

        const result = mstdog(customSchema.paths, customOptions);
        expect(result).toHaveProperty('customField', 'Custom Value');
    });

    it('should limit the depth of nested objects', () => {
        const deepSchema = new Schema({
            level1: { type: new Schema({
                level2: { type: new Schema({
                    level3: { type: String }
                }) }
            }) }
        });

        const result = mstdog(deepSchema.paths, { maxDepth: 2 });
        expect(result).toHaveProperty('level1');
        expect(result.level1).toHaveProperty('level2');
        expect(result.level1.level2).toEqual({}); // Should not go deeper than maxDepth
    });

    it('should handle enum values correctly', () => {
        const enumSchema = new Schema({
            status: { type: String, enum: ['active', 'inactive', 'pending'] }
        });

        const result = mstdog(enumSchema.paths);
        expect(result).toHaveProperty('status');
        expect(['active', 'inactive', 'pending']).toContain(result.status);
    });

    it('should handle ObjectId correctly', () => {
        const objectIdSchema = new Schema({
            user: { type: Types.ObjectId }
        });

        const result = mstdog(objectIdSchema.paths);
        expect(result).toHaveProperty('user');
        expect(Types.ObjectId.isValid(result.user)).toBe(true);
    });

    it('should handle mixed type correctly', () => {
        const mixedSchema = new Schema({
            misc: { type: Schema.Types.Mixed }
        });

        const result = mstdog(mixedSchema.paths);
        expect(result).toHaveProperty('misc');
        expect(result.misc).toHaveProperty('a');
        expect(result.misc).toHaveProperty('b');
    });
});
