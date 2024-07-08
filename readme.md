# Mongoose Schema to Dummy Object Generator (mstdog)

Generate realistic mock data for your Mongoose schemas with ease.

---

## Description

`mstdog` is a simple and efficient tool to generate mock data based on your Mongoose schemas. Integrated with the `faker` library, it ensures that you get realistic mock data for each field type. It supports various field types, embedded subdocuments, arrays, and can now handle `ref` attributes to simulate population of referenced documents.

## Installation

Install the package using npm:

```bash
npm install mstdog --save-dev
```

## Usage

```javascript
import mstdog from 'mstdog';
import { Schema, Types } from 'mongoose';

// Define your Mongoose schema
const yourSchema = new Schema({
    name: String,
    age: Number,
    isActive: Boolean,
    birthdate: Date,
    tags: [String], // Example of an array of basic types
    profile: { type: Schema.Types.ObjectId, ref: 'Profile' }, // Example of a ref to another schema
    details: { // Example of an embedded subdocument
        address: {
            street: String,
            city: String
        }
    }
});

const mockData = mstdog(yourSchema.paths);
console.log(mockData);
```

### Supported Field Types

- **String**: Supports `enum` values.
- **Number**
- **Date**
- **Boolean**
- **ObjectId**: Generates valid MongoDB ObjectIds.
- **Mixed**: Handles fields of mixed types.
- **Embedded subdocuments**: Recursively generates mock data for nested schemas.
- **Arrays**: Supports arrays of basic types (`[String]`, `[Number]`, `[Date]`, etc.) and arrays of embedded subdocuments.
- **References (`ref`)**: Optionally simulates the population of referenced documents.

### Options

`mstdog` supports several options to customize data generation, including advanced handling of document references:

-

**arrayLength**: Specify the length of arrays to generate (default: `3`).
- **maxDepth**: Limit the depth of nested objects generated (default: `5`).
- **handleRefs**: Enable or disable the simulation of referenced documents (default: `false`).
- **schemas**: Provide a map of schema definitions to support document references.
- **customFieldGenerators**: Provide custom functions to generate data for specific fields.

Example with options:

```javascript
const profileSchema = new Schema({
    age: Number,
    interests: [String]
});

const options = {
    arrayLength: 5, // Generate arrays with 5 elements
    maxDepth: 3, // Limit nested objects to a depth of 3
    handleRefs: true, // Enable handling of references
    schemas: { // Required when handleRefs is true
        Profile: profileSchema
    },
    customFieldGenerators: {
        name: () => 'Custom Name' // Override data generation for 'name' field
    }
};

const mockDataWithOptions = mstdog(yourSchema.paths, options);
console.log(mockDataWithOptions);
```

### Type Generators

`mstdog` allows you to customize how data is generated for specific types using the `typeGenerators` option. This enables overriding the default data generation logic provided by the library.

Example using `typeGenerators`:

```javascript
const options = {
    typeGenerators: {
        string: () => 'Custom string',  // Applies to both `string` and `schemastring`
        number: () => 42,
        date: () => new Date('2020-01-01')
    }
};

const mockData = mstdog(yourSchema.paths, options);
console.log(mockData);
```

## Contributing

Feedback, bug reports, and pull requests are welcome. Feel free to improve and suggest any changes.

## License

[MIT](./LICENSE)
