class LocalDateTime {
  constructor(date) {
    this.datetime =
      date.getFullYear() +
      '/' +
      (date.getMonth() + 1) +
      '/' +
      date.getDate() +
      ' ' +
      date.getHours() +
      ':' +
      date.getMinutes();

    return this.datetime;
  }
}

module.exports = LocalDateTime;
