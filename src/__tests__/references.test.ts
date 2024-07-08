import mstdog from '../index';
import { Schema, Types } from "mongoose";

describe('mstdog with ref handling', () => {
    const profileSchema = new Schema({
        age: Number,
        interests: [String]
    });

    const userSchema = new Schema({
        name: String,
        email: String,
        profile: { type: Schema.Types.ObjectId, ref: 'Profile' }
    });

    const schemas = {
        Profile: profileSchema
    };

    it('should handle references correctly when enabled', () => {
        const options = {
            handleRefs: true,
            schemas: schemas
        };

        const result = mstdog(userSchema.paths, options);
        expect(result).toHaveProperty('profile');
        expect(typeof result.profile).toBe('object');
        expect(result.profile).toHaveProperty('age');
        expect(result.profile).toHaveProperty('interests');
        expect(Array.isArray(result.profile.interests)).toBe(true);
    });

    it('should not populate references if handleRefs is false', () => {
        const options = {
            handleRefs: false,
            schemas: schemas
        };

        const result = mstdog(userSchema.paths, options);
        expect(result).toHaveProperty('profile');
        // Expect the profile to be an ObjectId when not handling refs
        expect(Types.ObjectId.isValid(result.profile)).toBe(true);
    });
});
