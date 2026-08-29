export default {
  // cargo fmt doesn't accept individual file paths — use a function to ignore
  // the filenames passed by lint-staged and run the command unconditionally
  'contracts/**/*.rs': () => 'cargo fmt --all --check',
  'frontend/**/*.{ts,tsx,js,jsx}': ['npm --prefix frontend run typecheck'],
  'backend/**/*.{ts,js}': ['npm --prefix backend run typecheck'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  'frontend/**/*.{json,md,css}': ['prettier --write'],
  'backend/**/*.{json,md,css}': ['prettier --write'],
};
