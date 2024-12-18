import React, { useRef, useState } from 'react';

import { IdProp } from 'starfx';
import { useDispatch, useSelector } from 'starfx/react';

import './App.css'; // Ensure you include the CSS below
import { optimisticUsers } from './state/selectors';
import { addUser, removeUser, updateUser } from './state/thunks';
import { IUser } from './types';

function App() {
  const dispatch = useDispatch();
  const users = useSelector(optimisticUsers);
  const emailRef = useRef<HTMLInputElement>(null);
  const [editId, setEditId] = useState<IdProp>();

  const handleAddUser = () => {
    const email = emailRef.current!.value.trim();
    if (email) {
      dispatch(addUser({ email }));
      emailRef.current!.value = '';
    }
  };

  const handleRemoveUser = (id: number) => {
    dispatch(removeUser([id]));
  };

  const handleEditUser = (id: IdProp) => {
    setEditId(id);
  };

  const handleUpdateUser = () => {
    setEditId(undefined);
  };

  const onChangeEmail = (id: number, email: string) => {
    dispatch(updateUser({ id, email }));
  };

  return (
    <div className="app-container">
      <h2 className="app-header">Example for basic CRUD operations using Starfx and ElectricSQL</h2>

      <div className="user-grid">
        <div className="grid-header">ID</div>
        <div className="grid-header">Email</div>
        <div className="grid-header">Actions</div>

        {Object.values(users).map((user: IUser) => (
          <React.Fragment key={user.id}>
            <div className="grid-item">{user.id}</div>
            {editId === user.id ? (
              <input
                className="grid-input"
                type="email"
                defaultValue={user.email}
                onBlur={(e) => onChangeEmail(+user.id, e.target.value)}
              />
            ) : (
              <div className="grid-item">{user.email}</div>
            )}
            <div className="grid-item">
              {editId === user.id ? (
                <button className="btn btn-update" onClick={handleUpdateUser}>
                  Update
                </button>
              ) : (
                <button className="btn btn-edit" onClick={() => handleEditUser(user.id)}>
                  Edit
                </button>
              )}
              <button className="btn btn-remove" onClick={() => handleRemoveUser(user.id)}>
                Remove
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="add-user">
        <input
          ref={emailRef}
          className="add-input"
          type="email"
          placeholder="Enter new email"
        />
        <button className="btn btn-add" onClick={handleAddUser}>
          Add User
        </button>
      </div>
    </div>
  );
}

export default App;
