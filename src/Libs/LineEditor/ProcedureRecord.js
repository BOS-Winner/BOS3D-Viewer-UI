class ProcedureRecord {
  constructor() {
    this.init();
  }

  init() {
    this.procedure = [];
    this.pointer = 0;
  }

  record(type, payload) {
    if (this.pointer < this.procedure.length) {
      this.procedure = this.procedure.slice(0, this.pointer);
    }
    this.procedure.push({
      type,
      payload,
    });
    this.pointer += 1;
    // console.debug('record', this.procedure, this.pointer);
  }

  undo(callback) {
    if (this.canUndo()) {
      // console.debug('undo', this.procedure, this.pointer);
      this.pointer -= 1;
      callback(this.procedure[this.pointer]);
    }
  }

  canUndo() {
    return this.pointer > 0;
  }

  redo(callback) {
    if (this.canRedo()) {
      // console.debug('redo', this.procedure, this.pointer);
      callback(this.procedure[this.pointer]);
      this.pointer += 1;
    }
  }

  canRedo() {
    return this.pointer < this.procedure.length;
  }
}

export default ProcedureRecord;
