
# Mongoose Schema to Dummy Object Generator

Generate realistic mock data for your Mongoose schemas with ease.

## Description

`mstdog` is a simple and efficient tool to generate mock data based on your Mongoose schemas. It supports various field types, embedded subdocuments, arrays, and more. Integrated with the `faker` library, it ensures that you get realistic mock data for each field type.

## Installation

Install the package using npm:

```bash
npm install mstdog --save-dev
```

## Usage

```javascript
import { generateMockDataForSchema } from 'mstdog';
import { YourMongooseSchema } from './path-to-your-schema';

const mockData = generateMockDataForSchema(YourMongooseSchema.paths);
console.log(mockData);
```

### Supported Field Types

- String
- Number
- Date
- Boolean
- ObjectId
- Mixed
- Embedded subdocuments
- Arrays of basic types and subdocuments

## Contributing

Feedback, bug reports, and pull requests are welcome. Feel free to improve and suggest any changes.

## License

[MIT](LICENSE)

---

You can customize this template further based on your needs. Make sure to include a `LICENSE` file in your repository if you reference it in the README. The MIT license is commonly used for open-source projects, but you can choose any license you prefer.