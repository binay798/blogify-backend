import { Query } from 'mongoose';
import { UserSchema } from './../models/user.model';
import * as core from 'express-serve-static-core';

export class ApiFeatures {
  constructor(
    public query: Query<{}[], {}, {}, {}>,
    public queryObj: core.Query
  ) {}

  filter(): this {
    let reqQuery = { ...this.queryObj };
    const excludedFields = ['sort', 'page', 'limit', 'fields', 'populate'];
    excludedFields.forEach((item) => {
      delete reqQuery[item];
    });
    this.query = this.query.find(reqQuery);
    return this;
  }

  fields() {
    if (this.queryObj.fields) {
      let fieldBody = this.queryObj.fields as string;
      fieldBody = fieldBody.split(',').join(' ');
      this.query = this.query.select(fieldBody);
    } else {
      this.query = this.query.select('-_v');
    }
    return this;
  }

  sort(): this {
    if (this.queryObj.sort) {
      let sortStr = this.queryObj.sort as string;
      sortStr = sortStr.split(',').join(' ');
      this.query = this.query.sort(sortStr);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  pagination() {
    if (this.queryObj.page || this.queryObj.limit) {
      let page: string | number = this.queryObj.page as string;
      page = parseInt(page) || 1;
      let limit: string | number = this.queryObj.limit as string;
      limit = parseInt(limit) || 100;
      // const limit = parseInt(req.query.limit) || 100;
      this.query = this.query.skip((page - 1) * limit).limit(limit);
    } else {
      this.query = this.query.skip(0).limit(10);
    }
    return this;
  }

  // NEEDS TO BE REFACTORED FOR GETTING SELECTED FIELDS
  populate() {
    if (this.queryObj.populate) {
      const populatedText: string = this.queryObj.populate as string;
      const newPopulatedText: string[] = populatedText.split(',');
      this.query = this.query.populate(newPopulatedText);
    }
    return this;
  }
}
