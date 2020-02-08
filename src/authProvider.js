import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";

const authProvider = {
  login: ({ username, password }) => {
    return new Promise((resolve, reject) => {
      Meteor.loginWithPassword(username, password, (err) => {
        if (err) {
          console.log('Error in Meteor.loginWithPassword : ', err);
          reject(err);
        } else {
          const userId = Meteor.userId();
          if (!userId) return reject(new Error('Login failed'));
          if (!Roles.userIsInRole(userId, "admin")) {
            Meteor.logout();
            return reject(new Error('Login forbidden'));
          }
          console.log("LOGIN accepted");
          resolve();
        }
      });
    });
  },
  logout: params => { 
    return new Promise((resolve, reject) => {
      Meteor.logout(err => {
        if (err) { 
          console.log("ERROR on logout", err);
          reject(err);
        }
        console.log("LOGOUT");
        resolve();
      });
    });
  },
  checkAuth: params => {
    console.log("checkAuth", params, Meteor.user());
    const userId = Meteor.userId();
    if (!userId) return Promise.reject({ redirectTo: '/login' });
    if (!Roles.userIsInRole(userId, "admin")) return Promise.reject();
    return Promise.resolve();
  },
  checkError: error => {
    console.log("checkError", error);
    return Promise.resolve()
  },
  getPermissions: params => {
    const userId = Meteor.userId();
    if (!userId) return Promise.reject();
    const roles = Roles.getRolesForUser(userId);
    console.log("getPermissions", roles);
    return roles ? Promise.resolve(roles) : Promise.reject();
  },
};

export default authProvider;
