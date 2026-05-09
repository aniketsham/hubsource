# Contributing to HubSource

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to HubSource. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

Please be respectful and constructive in all interactions with other contributors.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [issue list](https://github.com/yourusername/hubsource/issues) as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots if possible**
- **Include your environment** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/yourusername/hubsource/issues). When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the TypeScript/React styleguides
- Include appropriate test cases
- End all files with a newline
- Avoid platform-specific code
- Ensure the PR description clearly describes the problem and solution

## Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/hubsource.git
   cd hubsource
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a branch for your feature**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** and commit with clear messages

   ```bash
   git commit -m "Add feature: description"
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** with a clear description

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Examples:
  - `Add authentication flow for user login`
  - `Fix: correct typo in README`
  - `Refactor: simplify resource fetching logic`

### TypeScript/React StyleGuide

- Use TypeScript for all new files
- Use functional components with hooks
- Use camelCase for variable and function names
- Use PascalCase for component names
- Add JSDoc comments for complex functions
- Example:
  ```typescript
  /**
   * Fetches user resources from the database
   * @param userId - The user's ID
   * @returns Promise containing user resources
   */
  async function fetchUserResources(userId: string): Promise<Resource[]> {
    // Implementation
  }
  ```

### CSS/Tailwind StyleGuide

- Use Tailwind CSS classes for styling
- Avoid inline styles
- Use component-scoped styles when necessary
- Follow Tailwind's utility-first approach

## Testing

- Write tests for new features
- Ensure all tests pass before submitting a PR
- Aim for reasonable code coverage

## Additional Notes

### Issue and Pull Request Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information is requested

## Questions?

Feel free to open an issue with the `question` label.

---

**Happy coding!** 🚀
