import { createSelector, IdProp } from 'starfx';

import { IUser } from '../types';
import { OPTI_ADDING, OPTI_REMOVING, OPTI_UPDATING } from './constants';
import { schema } from './schema';

export const optimisticUsers = createSelector(
  schema.users.selectTable,
  schema.loaders.selectTable,
  (users, loaders) => {
    //filter updating users
    const updating =
      loaders[`users-${OPTI_UPDATING}`]?.status === "loading"
        ? (loaders[`users-${OPTI_UPDATING}`].meta as Record<IdProp, IUser>)
        : {};

    //filter adding users
    const adding =
      loaders[`users-${OPTI_ADDING}`]?.status === "loading"
        ? (loaders[`users-${OPTI_ADDING}`].meta as Record<IdProp, IUser>)
        : {};

    //get removing users
    const deleting =
      loaders[`users-${OPTI_REMOVING}`]?.status === "loading"
        ? (loaders[`users-${OPTI_REMOVING}`].meta as number[])
        : [];

    const allUsers = { ...users, ...updating, ...adding } as Record<IdProp, IUser>;

    // omit the deleting users
    if (deleting.length === 0) return allUsers;
    for (const id of deleting) {
      delete allUsers[id];
    }

    return allUsers;
  },
);
