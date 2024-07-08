
# Mongoose Schema to Dummy Object Generator

Generate realistic mock data for your Mongoose schemas with ease.

---

## Description

`mstdog` is a simple and efficient tool to generate mock data based on your Mongoose schemas. It supports various field types, embedded subdocuments, arrays, and more. Integrated with the `faker` library, it ensures that you get realistic mock data for each field type.

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
- **Arrays**: Supports arrays of basic types (`[String]`, `[Number]`, `[Date]`, etc.) and arrays of embedded subdocuments (`[{ type: YourSubdocumentSchema }]`).

### Options

`mstdog` supports several options to customize data generation:

- **arrayLength**: Specify the length of arrays to generate (default: `3`).
- **maxDepth**: Limit the depth of nested objects generated (default: `5`).
- **customFieldGenerators**: Provide custom functions to generate data for specific fields.

Example with options:

```javascript
const options = {
    arrayLength: 5, // Generate arrays with 5 elements
    maxDepth: 3, // Limit nested objects to a depth of 3
    customFieldGenerators: {
        name: () => 'Custom Name' // Override data generation for 'name' field
    }
};

const mockDataWithOptions = mstdog(yourSchema.paths, options);
console.log(mockDataWithOptions);
```

## Contributing

Feedback, bug reports, and pull requests are welcome. Feel free to improve and suggest any changes.

## License

[MIT](./LICENSE)

---
