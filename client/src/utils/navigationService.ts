// Holds the navigate function from useNavigate
let navigator: ((path: string) => void) | null = null;

export const setNavigator = (navigateFunction: (path: string) => void) => {
  navigator = navigateFunction;
};

export const navigate = (path: string) => {
  if (navigator) {
    navigator(path);
  } else {
    console.warn('Navigation service not initialized');
    window.location.href = path;
  }
};