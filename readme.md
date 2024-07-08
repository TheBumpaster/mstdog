# Mongoose Schema to Dummy Object Generator

Generate realistic mock data for your Mongoose schemas with ease.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Handling Different Field Types](#handling-different-field-types)
  - [Custom Field Generators](#custom-field-generators)
  - [Type Generators](#type-generators)
  - [Handling Dependencies](#handling-dependencies)
- [Options](#options)
- [Contributing](#contributing)
- [License](#license)

## Description

`mstdog` is a simple and efficient tool to generate mock data based on your Mongoose schemas. It supports various field types, embedded subdocuments, arrays, and more. Integrated with the `faker` and `randexp` library, it ensures that you get realistic mock data for each field type.

## Installation

Install the package using npm:

```bash
npm install mstdog --save-dev
```

## Usage

### Basic Usage

```javascript
import mstdog from 'mstdog';
import { Schema } from 'mongoose';

const userSchema = new Schema({
    name: String,
    age: Number,
    isActive: Boolean,
    birthdate: Date,
});

const mockData = mstdog(userSchema.paths);
console.log(mockData);
```

### Handling Different Field Types

```javascript
const addressSchema = new Schema({
    street: String,
    city: String,
    zipcode: String,
});

const educationSchema = new Schema({
    degree: String,
    institution: String,
    year: Number,
});

const userSchema = new Schema({
    name: String,
    age: Number,
    isActive: Boolean,
    birthdate: Date,
    bio: {
        type: String,
        text: true,
    },
    address: addressSchema,
    education: [educationSchema],
    hobbies: [String],
    scores: [Number],
});

const mockData = mstdog(userSchema.paths);
console.log(mockData);
```

### Custom Field Generators

```javascript
const options = {
    customFieldGenerators: {
        name: () => 'Custom Name',
        age: () => 25,
    }
};

const mockData = mstdog(userSchema.paths, options);
console.log(mockData);
```

### Type Generators

```javascript
const options = {
    typeGenerators: {
        string: () => 'Custom String',
        number: () => 42,
    }
};

const mockData = mstdog(userSchema.paths, options);
console.log(mockData);
```

### Handling Dependencies

```javascript
const options = {
    typeGenerators: {
        string: (mockData, fieldOptions) => {
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

const mockData = mstdog(userSchema.paths, options);
console.log(mockData);
```

## Options

`mstdog` supports several options to customize data generation:

- **arrayLength**: Specify the length of arrays to generate (default: `3`).
- **maxDepth**: Limit the depth of nested objects generated (default: `5`).
- **customFieldGenerators**: Provide custom functions to generate data for specific fields.
- **typeGenerators**: Provide custom functions to generate data for specific types.
- **typeGeneratorDependencies**: Define dependencies between fields to ensure correct generation order.

Example with options:

```javascript
const options = {
    arrayLength: 5, // Generate arrays with 5 elements
    maxDepth: 3, // Limit nested objects to a depth of 3
    customFieldGenerators: {
        name: () => 'Custom Name', // Override data generation for 'name' field
    },
    typeGenerators: {
        string: () => 'Custom String',
        number: () => 42,
    },
    typeGeneratorDependencies: {
        "root": {
            "email": ["username"]
        }
    }
};

const mockDataWithOptions = mstdog(userSchema.paths, options);
console.log(mockDataWithOptions);
```

## Contributing

Feedback, bug reports, and pull requests are welcome. Feel free to improve and suggest any changes.

## License

[MIT](./LICENSE)
