/**
 * Custom Jest transformer that wraps babel-jest.
 *
 * react-native 0.76+ uses Flow "mapped type" syntax in some internal files
 * (e.g. Libraries/vendor/emitter/EventEmitter.js):
 *
 *   type Foo = { [K in keyof T]: ... };
 *
 * @babel/parser does not yet support this Flow syntax, so we strip it with
 * a regex before Babel parses the file.  The replacement is semantically
 * safe for tests because Flow types are erased at runtime regardless.
 */
const babelJest = require('babel-jest');

// babel-jest exports { default, createTransformer }
const createTransformer = babelJest.createTransformer || babelJest.default?.createTransformer;
const baseTransformer = createTransformer ? createTransformer({}) : babelJest.default;

// Replace  [K in keyof SomeType]  →  [string]
// This pattern only appears inside Flow type declarations and is safe to stub.
const FLOW_MAPPED_TYPE_RE = /\[\s*\w+\s+in\s+keyof\s+\w+(?:<[^\]]*>)?\s*\]/g;

module.exports = {
  process(sourceText, sourcePath, options) {
    const preprocessed = sourceText.replace(FLOW_MAPPED_TYPE_RE, '[string]');
    return baseTransformer.process(preprocessed, sourcePath, options);
  },
  processAsync: baseTransformer.processAsync
    ? async function (sourceText, sourcePath, options) {
        const preprocessed = sourceText.replace(FLOW_MAPPED_TYPE_RE, '[string]');
        return baseTransformer.processAsync(preprocessed, sourcePath, options);
      }
    : undefined,
  getCacheKey: baseTransformer.getCacheKey
    ? baseTransformer.getCacheKey.bind(baseTransformer)
    : undefined,
  getCacheKeyAsync: baseTransformer.getCacheKeyAsync
    ? baseTransformer.getCacheKeyAsync.bind(baseTransformer)
    : undefined,
};
