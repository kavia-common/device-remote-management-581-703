# Store

- Redux Toolkit store is created in index.js and exported as default and named `store`.
- Slices:
  - authSlice: loginSuccess, logout, selectors selectIsAuthenticated, selectToken, selectUser
  - uiSlice: showSnackbar, hideSnackbar, selector selectSnackbar
  - themeSlice: toggleTheme, setThemeMode, selector selectThemeMode
