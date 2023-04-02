class APIFeatures {
  constructor(query, queryObject) {
    this.query = query;
    this.queryObject = queryObject;
  }

  filter() {
    // 1.) Simple and advanced filters.
    let queryObjectCopy = { ...this.queryObject };

    // Remove filter that has meaning in moongoose.
    const excludedQueries = ['sort', 'page', 'limit', 'fields'];
    excludedQueries.forEach(
      (excludedQuery) => delete queryObjectCopy[excludedQuery]
    );

    // We replace add "$" to the conditional expression.
    let queryString = JSON.stringify(queryObjectCopy);
    queryString = queryString.replace(
      /\b(gt|lt|gte|lte)\b/g,
      (match) => `$${match}`
    );

    queryObjectCopy = JSON.parse(queryString);
    this.query = this.query.find(queryObjectCopy);

    return this;
  }

  sort() {
    if (this.queryObject.sort) {
      const sortString = this.queryObject.sort.split(',').join(' ');
      this.query = this.query.sort(sortString);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  select() {
    if (this.queryObject.select) {
      const selectString = this.queryObject.select.split(',').join(' ');
      this.query = this.query.select(selectString);
      this.query = this.query.select('-__v');
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = +this.queryObject.page || 1;
    const limit = +this.queryObject.limit || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
