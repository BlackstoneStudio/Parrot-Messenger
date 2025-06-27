# Contributing to Parrot Messenger

We love your input! We want to make contributing to Parrot Messenger as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Request Process

1. Fork the repo and create your branch from `master` or `develop`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes with 100% coverage
5. Make sure your code lints
6. Create a Pull Request using our template

## Commit Message Format

All commits must follow this format:

```
TYPE (Issue) Brief summary
```

Where `Issue` can be:

- `#123` - GitHub issue number
- `PROJ-123` - External tracking system reference
- `NA` - For commits without an associated issue

### Valid Types:

- `BREAK` - Breaking changes
- `CI` - Changes in CI or docker files
- `DEPEN` - Changes in project dependencies
- `DOCS` - Documentation changes
- `ESLINT` - Eslint/stylelint rule changes
- `FEAT` - New feature
- `FILES` - File/folder structure changes
- `FIX` - Bug fixes
- `FUNC` - Functionality changes to existing components
- `STYLE` - Style file changes
- `TEST` - Test additions/edits
- `DB` - Database-related changes

### Examples:

```
FEAT (#123) Add support for Telnyx SMS provider
FIX (#124) Resolve validation error for phone numbers
DOCS (NA) Update API reference for new error types
TEST (#125) Add coverage for edge cases in validation
```

## Setting Up Git Commit Template

To use our commit message template:

```bash
git config --local commit.template .gitmessage
```

## Development Process

1. **Clone and install**

   ```bash
   git clone https://github.com/BlackstoneStudio/Parrot-Messenger.git
   cd Parrot-Messenger
   npm install
   ```

2. **Create a branch**

   ```bash
   git checkout -b TYPE/brief-description
   # Example: git checkout -b feat/add-telnyx-support
   # Or with issue number: git checkout -b feat/123-add-telnyx-support
   ```

3. **Make your changes**
   - Write your code
   - Add/update tests
   - Update documentation

4. **Test your changes**

   ```bash
   npm test                    # Run tests
   npm test -- --coverage     # Check coverage
   npm run lint              # Check linting
   npm run build             # Ensure it builds
   ```

5. **Commit your changes**

   ```bash
   git add .
   git commit  # This will open the template
   ```

6. **Push and create PR**
   ```bash
   git push origin your-branch
   ```
   Then create a PR using the GitHub UI

## Code Style

- We use ESLint with TypeScript
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Testing Standards

- Maintain 100% code coverage
- Write unit tests for all new code
- Include edge cases in your tests
- Mock external dependencies
- Use descriptive test names

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issues](https://github.com/BlackstoneStudio/Parrot-Messenger/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/BlackstoneStudio/Parrot-Messenger/issues/new).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/master/CONTRIBUTING.md)
