import mstdog, { MstdogOptions } from '../index'; // Adjust the import path as necessary

describe('Dynamic Data Generation with mstdog', () => {
    const userSchema = {
        username: { type: String },
        email: { type: String }
    };

    // Test for generating email based on username
    it('should generate an email based on the username', () => {
        const options: MstdogOptions<any> = {
            typeGenerators: {
                string: (mockData, fieldOptions) => {
                    if (fieldOptions?.fieldName === 'email') {
                        return `${mockData.username}@example.com`;
                    }
                    return "defaultUsername";
                }
            }
        };

        const result = mstdog(userSchema, options);
        expect(result.email).toBe(`${result.username}@example.com`);
    });

    // Test for handling dependencies when fields are not yet generated
    it('should handle field dependencies correctly', () => {
        const options: MstdogOptions<any> = {
            typeGenerators: {
                string: (mockData, fieldOptions) => {
                    // Attempting to generate email before username should fallback or handle gracefully
                    if (fieldOptions?.fieldName === 'email') {
						if (mockData.username) {
							return `${mockData.username}@example.com`;
                    	} else {
							return "random@email.com"
						}
					}
					
					if (fieldOptions?.fieldName === 'username') {
                        return "generatedUsername";
                    }

                    return "randomString";
                }
            },
            typeGeneratorDependencies: {
                "root": {
                    "email": ["username"]
                }
            }
        };

        const result = mstdog(userSchema, options);
        expect(result.username).toBe("generatedUsername");
        expect(result.email).toBe("generatedUsername@example.com"); // Should handle gracefully
    });

    // Test for correct handling of custom generators without dependencies
    it('should use custom generators correctly for independent fields', () => {
        const options: MstdogOptions<any> = {
            typeGenerators: {
                string: (mockData, fieldOptions) => {
                    // Apply custom logic without dependency
                    if (fieldOptions?.fieldName === 'username') {
                        return "independentUsername";
                    }
                    return "default";
                }
            }
        };

        const result = mstdog(userSchema, options);
        expect(result.username).toBe("independentUsername");
    });
});
