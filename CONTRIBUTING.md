# Contributing to Kawane Studio Backend

Terima kasih telah tertarik untuk berkontribusi pada proyek Kawane Studio Backend! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

Proyek ini mengikuti [Code of Conduct](CODE_OF_CONDUCT.md). Dengan berpartisipasi, Anda diharapkan untuk menghormati kode etik ini.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x atau lebih baru
- PostgreSQL 15.x atau lebih baru
- Redis (opsional, untuk caching)
- Git

### Development Setup

1. **Fork repository**
   ```bash
   # Fork repository di GitHub, lalu clone
   git clone https://github.com/YOUR_USERNAME/kawane-studio-backend.git
   cd kawane-studio-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp env.example .env
   # Edit .env dengan konfigurasi development Anda
   ```

4. **Setup database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Making Changes

### Branch Strategy

- `main/master` - Production ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical fixes

### Creating a Branch

```bash
# Dari develop branch
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Commit Messages

Gunakan format commit message yang jelas:

```
type(scope): description

- Detail perubahan
- Alasan perubahan
- Breaking changes (jika ada)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Example:**
```
feat(auth): add Google OAuth integration

- Implement Google OAuth login
- Add user profile sync
- Update authentication middleware
```

## 📝 Pull Request Process

### Before Submitting

1. **Update documentation** jika diperlukan
2. **Add tests** untuk fitur baru
3. **Run linting** dan pastikan tidak ada error
4. **Test functionality** secara menyeluruh

### PR Checklist

- [ ] Code follows coding standards
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (atau documented)
- [ ] Commit messages clear
- [ ] Branch up to date with target

### Submitting PR

1. **Push branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Title yang jelas dan deskriptif
   - Description yang menjelaskan perubahan
   - Link ke related issues
   - Screenshots (jika UI changes)

3. **Review Process**
   - Maintainer akan review code
   - Address feedback jika ada
   - Update PR jika diperlukan

## 📏 Coding Standards

### TypeScript

- Gunakan TypeScript strict mode
- Define types untuk semua functions
- Gunakan interfaces untuk object shapes
- Prefer `const` over `let`

### Code Style

- 2 spaces untuk indentation
- Single quotes untuk strings
- Semicolons di akhir statements
- Trailing commas untuk objects/arrays

### File Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routers/         # Route definitions
├── middlewares/     # Custom middlewares
├── utils/           # Utility functions
└── types/           # Type definitions
```

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Variables**: camelCase (`userData`)

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "user service"
```

### Writing Tests

- Test file harus berakhiran `.test.ts`
- Gunakan descriptive test names
- Test both success dan error cases
- Mock external dependencies

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { getUserService } from '../services/user/get-user.service';

describe('getUserService', () => {
  it('should return user data when user exists', async () => {
    // Arrange
    const userId = 'valid-user-id';
    
    // Act
    const result = await getUserService({ userId });
    
    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(userId);
  });
});
```

## 📚 Documentation

### Code Documentation

- Gunakan JSDoc untuk functions
- Comment complex logic
- Update README jika ada perubahan setup

### API Documentation

- Update API endpoints di README
- Document request/response formats
- Include example requests

## 🐛 Bug Reports

### Before Reporting

1. Cek existing issues
2. Update ke latest version
3. Test dengan clean environment

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What should happen.

**Screenshots**
If applicable.

**Environment:**
- OS: [e.g. Windows 10]
- Node.js version: [e.g. 18.17.0]
- Database: [e.g. PostgreSQL 15]

**Additional context**
Any other context.
```

## 💡 Feature Requests

### Before Requesting

1. Cek existing feature requests
2. Consider if fit dengan project scope
3. Provide detailed use case

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem.

**Describe the solution you'd like**
Clear description of what you want.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other context or screenshots.
```

## 📞 Getting Help

- **GitHub Issues**: Untuk bugs dan feature requests
- **Discussions**: Untuk pertanyaan umum
- **Email**: support@kawanestudio.com

## 🎉 Recognition

Kontributor akan diakui di:
- README contributors section
- Release notes
- Project documentation

Terima kasih untuk kontribusi Anda! 🙏
