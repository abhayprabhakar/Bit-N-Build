import React from 'react';

const CurrencyContext = React.createContext({
  currency: 'USD',
  setCurrency: () => {},
});

export { CurrencyContext };
export default CurrencyContext;
