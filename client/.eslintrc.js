// .eslintrc.js
module.exports = {
    parser: "@babel/eslint-parser", // Adjust parser as needed
    parserOptions: {
        ecmaVersion: 2021, // Adjust ecmaVersion as needed
        sourceType: "module", // Adjust sourceType as needed
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        es2021: true,
    },
    plugins: [
        "react",
    ],
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
    ],
    rules: {
        "object-curly-spacing": ["error", "always"],
        // "quotes": ["error", "double"],
    },
};
