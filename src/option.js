class Option {
  static of(value) {
    if (value === undefined || value === null)
      return None.NONE;
    return new Some(value);
  }

  static empty() {
    return None.NONE;
  }

  orElse(value) {
  }

  map(mapper) {
  }

  isEmpty() {
  }
}

class None extends Option {
  orElse(value) {
    return value;
  }

  map(mapper) {
    return this;
  }

  isEmpty() {
    return true;
  }
}

None.NONE = new None();

class Some extends Option {
  constructor(value) {
    super();
    this.value = value;
  }

  orElse(value) {
    return this.value;
  }

  map(mapper) {
    return Option.of(mapper(this.value));
  }

  isEmpty() {
    return false;
  }
}

module.exports = Option;