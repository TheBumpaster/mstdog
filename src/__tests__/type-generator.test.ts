import mstdog from '../index';
import { Schema } from "mongoose";

describe('mstdog with typeGenerators', () => {
    const schema = new Schema({
        username: String,
        age: Number,
        registeredOn: Date,
        isActive: Boolean
    });

    it('should use custom type generators for specified types', () => {
        const options = {
            typeGenerators: {
                string: () => 'Custom String',
                number: () => 100,
                date: () => new Date('2024-01-01'),
                boolean: () => true
            }
        };

        const mockData = mstdog(schema.paths, options);

        // Check if the custom generators are applied correctly
        expect(mockData.username).toBe('Custom String');
        expect(mockData.age).toBe(100);
        expect(mockData.registeredOn).toEqual(new Date('2024-01-01'));
        expect(mockData.isActive).toBe(true);
    });

    it('should fall back to default generators if no custom generator provided', () => {
        // Provide a custom generator only for the string type
        const options = {
            typeGenerators: {
                string: () => 'Only Custom String'
            }
        };

        const mockData = mstdog(schema.paths, options);

        // Check the overridden type
        expect(mockData.username).toBe('Only Custom String');

        // Check types without custom generators
        // For this example, the actual content isn't checked, only the types
        expect(typeof mockData.age).toBe('number');
        expect(mockData.registeredOn).toBeInstanceOf(Date);
        expect(typeof mockData.isActive).toBe('boolean');
    });
});
