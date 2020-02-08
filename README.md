# ra-data-meteor
Meteor data provider for react-admin

## Install

Using **npm**:
```npm i lc3t35/ra-data-meteor history```

Using **yarn**:
```yarn add lc3t35/ra-data-meteor history```

```meteor add alanning:roles lai:collection-extensions```

## Usage

```jsx
// in app.js file

import React from 'react';
import { Admin, Resource } from 'react-admin';
import { createBrowserHistory as createHistory } from 'history';
import { meteorProvider, authProvider } from 'lc3t35/ra-data-meteor';
import { UserList } from "./pages/Dashboard/users";
import { ContactList } from "./pages/Dashboard/contacts";
import Dashboard from "./pages/Dashboard";

const history = createHistory();

const App = () => (
  <Admin
  dashboard={Dashboard}
    dataProvider={meteorProvider}
    authProvider={authProvider}
    history={history}
  >
    {permissions => [
      permissions && permissions.includes('admin') ? <Resource name="users" list={UserList} /> : null,
      permissions && permissions.includes('admin') ? <Resource name="contacts" list={ContactList} /> : null,
    ]}
  </Admin>
);

export default App;
```

## TODO

- [ ] write a Meteor testbed with tests with Users and Contacts collections
- [ ] add missing update, updateMany
- [ ] update TypeScript