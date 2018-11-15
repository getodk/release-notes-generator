class Option {
  static of(value) {
    if (value === undefined || value === null)
      return None.NONE;
    return new Some(value);
  }

  static empty() {
    return None.NONE;
  }

  static race(...options) {
    for (let option of options)
      if (option.isPresent())
        return option;
    return None.NONE;
  }

  get() {
  }

  orElse(value) {
  }

  orElseGet(valueSupplier) {
  }

  orUndefined() {
  }

  map(mapper) {
  }

  isPresent() {
  }

  isEmpty() {
  }
}

class None extends Option {
  get() {
    throw new Error("Value not present");
  }

  orElse(value) {
    return value;
  }

  orElseGet(valueSupplier) {
    return valueSupplier();
  }

  orUndefined() {
    return undefined;
  }

  map(mapper) {
    return this;
  }

  isPresent() {
    return false;
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

  get() {
    return this.value;
  }

  orElse(value) {
    return this.value;
  }

  orElseGet(valueSupplier) {
    return this.value;
  }

  orUndefined() {
    return this.value;
  }

  map(mapper) {
    return Option.of(mapper(this.value));
  }

  isPresent() {
    return true;
  }

  isEmpty() {
    return false;
  }
}

module.exports = Option;