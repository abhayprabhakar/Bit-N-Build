import React from 'react';

const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

// Provide both a named and default export so consumers can import either form.
export { ColorModeContext };
export default ColorModeContext;
