import { Meteor } from "meteor/meteor";
import _ from "underscore";

import { getCollectionByName } from "./getCollectionByName.js";

const propsForRegExp = ["username", "userId"];
const propsArraysForElemMatch = ["followedBy", "following", "blocked"];
const propForElemMatch = "userid";

export default {
  getList: (resource, params) => {
    console.log("DEBUG getList params ", resource, params);
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const { filter } = params;

    const sort = {};
    let fixField = field === "id" ? "_id" : field;
    sort[fixField] = order === "ASC" ? -1 : 1;
    const skip = (page - 1) * perPage;
    let refactorFilter;
    if (_.has(filter, "q") && filter.q.length === 0) {
      refactorFilter = {}; // use generic search
    } else {
      refactorFilter = _.mapObject(filter, (val, key) => {
        if (propsForRegExp.includes(key)) {
          return new RegExp(val.toLowerCase(), "i"); // search as regex in text fields
        }
        if (propsArraysForElemMatch.includes(key)) {
          return { $elemMatch: { [`${propForElemMatch}`]: val } }; // search in arrays
        }
        return val;
      });
    }
    const collection = getCollectionByName(resource);
    const total = collection.find(filter ? refactorFilter : {}).count();
    const getList = collection
      .find(filter ? refactorFilter : {}, {
        sort,
        limit: perPage,
        skip
      })
      .fetch();
    return Promise.resolve({
      data: getList.map(res => ({ ...res, id: res._id })),
      total
    });
  },

  getOne: (resource, params) => {
    console.log("DEBUG getOne params ", resource, params);
    const { id } = params;
    const collection = getCollectionByName(resource);
    const getOne = collection.findOne({ _id: id });
    return Promise.resolve({
      data: { ...getOne, id: getOne._id }
    });
  },

  getMany: (resource, params) => {
    console.log("DEBUG getMany params ", resource, params);
    const { ids } = params;
    const collection = getCollectionByName(resource);
    const getList = collection.find({ _id: { $in: ids } }).fetch();
    return Promise.resolve({
      data: getList.map(res => ({ ...res, id: res._id }))
    });
  },

  getManyReference: (resource, params) => {
    console.log("DEBUG getManyReferencence params ", resource, params);
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const { target, id, filter } = params;
    const sort = {};
    const fixField = field === "id" ? "_id" : field;
    sort[fixField] = order === "ASC" ? -1 : 1;
    const skip = (page - 1) * perPage;
    const collection = getCollectionByName(resource);
    const query = {
      [target]: id,
      ...filter
    };
    console.log("DEBUG getManyReferencence query: ", query);
    const total = collection.find(query).count();
    const getList = collection
      .find(query, {
        sort,
        limit: perPage,
        skip
      })
      .fetch();
    return Promise.resolve({
      data: getList.map(res => ({ ...res, id: res._id })),
      total
    });
  },

  update: (resource, params) => {
    console.log("DEBUG update params ", resource, params);
    return { data: null };
  },

  updateMany: (resource, params) => {
    console.log("DEBUG updateMany params ", resource, params);
    return { data: null };
  },

  create: (resource, params) => {
    console.log("DEBUG create params ", resource, params);
    const { data } = params;
    const collection = getCollectionByName(resource);
    const createdId = collection.insert({ data });
    return Promise.resolve({
      data: data.map(res => ({ ...res, id: createdId }))
    });
  },

  delete: (resource, params) => {
    console.log("DEBUG delete params ", resource, params);
    const { id } = params;
    const collection = getCollectionByName(resource);
    if (resource === "users") {
      Meteor.call("Admin.removeUser", { userId: id });
    } else {
      collection.remove({ _id: id });
    }
    return Promise.resolve({
      data: null
    });
  },

  deleteMany: (resource, params) => {
    console.log("DEBUG deleteMany params ", resource, params);
    const { ids } = params;
    const collection = getCollectionByName(resource);
    _.each(ids, id => {
      if (resource === "users") {
        Meteor.call("Admin.removeUser", { userId: id });
      } else {
        collection.remove({ _id: id });
      }
    });
    return Promise.resolve({
      data: ids
    });
  }
};
