# React App Example

This is a sample React application to demonstrate Smart Test Generator's capabilities with React components, hooks, and TypeScript.

## Features Demonstrated

- **React Hooks**: useState, useEffect, useCallback, useMemo
- **Custom Hooks**: useLocalStorage, useDebounce, useApi
- **Component Testing**: Props validation, event handling, conditional rendering
- **Context API**: Theme provider and user context
- **Async Operations**: API calls with loading states and error handling
- **TypeScript**: Strong typing for props, state, and API responses

## Generated Test Coverage

Smart Test Generator will create tests for:

1. **Components**:
   - UserProfile component with loading/error states
   - TodoList with CRUD operations
   - SearchInput with debounced search
   - ThemeToggle with context integration

2. **Hooks**:
   - useLocalStorage persistence logic
   - useDebounce with timer management
   - useApi with caching and error handling

3. **Utils**:
   - API client with retry logic
   - Validation functions
   - Data transformation helpers

## Running the Example

```bash
cd examples/react-app
npm install
npm run dev

# Generate tests
test-gen init
test-gen analyze src/
test-gen generate --coverage 95

# Run generated tests
npm test
```

## Expected Results

- **90%+** test coverage
- **25+** test files generated
- **Edge cases** automatically detected
- **Realistic mock data** for API responses
- **Accessibility testing** included
