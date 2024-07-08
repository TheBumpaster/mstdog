
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

const yourSchema = new Schema({
    name: String,
    age: Number,
    isActive: Boolean,
    birthdate: Date
});

const mockData = mstdog(yourSchema.paths);
console.log(mockData);
```

### Supported Field Types

- String _( supports enum )_
- Number
- Date
- Boolean
- ObjectId
- Mixed
- Embedded subdocuments
- Arrays of basic types and subdocuments _( supports enum )_

## Contributing

Feedback, bug reports, and pull requests are welcome. Feel free to improve and suggest any changes.

## License

[MIT](./LICENSE)

---
