1. INITIALIZE NODE.JS
   npm init -y

2. INSTALL REQUIRED PACKAGES
   npm install express prisma @prisma/client dotenv cors helmet \
   cookie-parser bcryptjs jsonwebtoken express-validator \
   express-rate-limit multer @supabase/supabase-js \
   node-cron resend compression winston

3. INSTALL NODEMON,JEST,SUPERTEST,ESLINT,PRETTIER
   npm install --save-dev nodemon jest supertest eslint prettier \
   eslint-config-prettier

4. INITIALIZE PRISMA
   npx prisma init

5. BUILD BACKEND FOLDERS(STRUCTURE)
   mkdir -p src/{config,controllers,middleware,models,routes,services,utils,errors,jobs}
   mkdir -p tests/{unit,integration}
   touch src/app.js index.js .env .env.example

6. ESLint and Prettier
   touch .eslintrc.json .prettierrc jsconfig.json

7. bACKEND/package.json - Script:
   {
   "name": "stokvel-backend",
   "version": "1.0.0",
   "scripts": {
   "start": "node index.js",
   "dev": "nodemon index.js",
   "test": "jest --runInBand --detectOpenHandles",
   "test:watch": "jest --watch",
   "lint": "eslint src/",
   "lint:fix": "eslint src/ --fix",
   "db:migrate": "prisma migrate dev",
   "db:push": "prisma db push",
   "db:studio": "prisma studio",
   "db:seed": "node prisma/seed.js",
   "db:reset": "prisma migrate reset"
   },
   "jest": {
   "testEnvironment": "node",
   "testMatch": ["**/tests/**/*.test.js"],
   "testTimeout": 30000,
   "setupFiles": ["<rootDir>/tests/setup.js"]
   }
   }

8. .eslintrc.json
   {
   "env": {
   "node": true,
   "es2022": true,
   "jest": true
   },
   "extends": ["eslint:recommended", "prettier"],
   "parserOptions": { "ecmaVersion": "latest" },
   "rules": {
   "no-console": "warn",
   "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
   }
   }

9. .prettierrc
   {
   "semi": true,
   "singleQuote": true,
   "tabWidth": 2,
   "trailingComma": "es5",
   "printWidth": 80
   }

10. jsconfig.js
    {
    "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2020",
    "checkJs": false
    },
    "exclude": ["node_modules"]
    }

11. Install axios: npm install axios

12. Install node-cron: npm install node-cron

13. npm install pdfkit csv-writer exceljs

14. touch render.yaml
