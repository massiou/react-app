import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Form from './Form';

function App() {
  return (
    <Switch>
      <Route exact path="/" component={Form} />
      <Route path="/confirmation" render={({ location }) => (
        <p>Merci pour votre soumission, {location.state.name} ! Nous avons envoyé un email à {location.state.email}.</p>
      )} />
    </Switch>
  );
}

export default App;