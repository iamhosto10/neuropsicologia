// Cliente de Sanity falso en memoria que imita las reglas REALES que nos han mordido:
//  - dos .append()/.insert() en el MISMO patch: el último sobrescribe al primero (se pierde el primero)
//  - ifRevisionID distinto al actual => error 409
//  - una transacción es atómica (si un patch falla, no se aplica nada)
export type Doc = Record<string, any>;

type Ops = {
  ifRevisionID?: string;
  set?: Record<string, any>;
  setIfMissing?: Record<string, any>;
  inc?: Record<string, number>;
  dec?: Record<string, number>;
  unset?: string[];
  insert?: { after: string; items: any[] };
};

export class FakeSanity {
  docs: Record<string, Doc> = {};
  resolvers: Array<[RegExp, (params: any, s: FakeSanity) => any]> = [];
  rev = 0;
  /** Se ejecuta antes de cada commit (para simular una escritura concurrente) */
  beforeCommit?: () => void;
  commits = 0;

  seed(doc: Doc) {
    this.docs[doc._id] = { _rev: `r${this.rev++}`, ...doc };
    return this;
  }
  on(re: RegExp, fn: (params: any, s: FakeSanity) => any) {
    this.resolvers.push([re, fn]);
    return this;
  }
  async fetch(query: string, params: any = {}) {
    for (const [re, fn] of this.resolvers) if (re.test(query)) return structuredClone(fn(params, this));
    throw new Error(`FakeSanity: consulta sin resolver: ${query.slice(0, 120)}`);
  }
  withConfig() {
    return this;
  }
  patch(id: string) {
    return new FakePatch(id);
  }
  transaction() {
    return new FakeTx(this);
  }
  /** Simula que OTRA petición modificó el documento (cambia _rev) */
  touch(id: string) {
    this.docs[id]._rev = `r${this.rev++}`;
  }
  /** Como Sanity real: no se puede crear/dejar un documento que referencia a uno inexistente */
  private assertIntegrity(docs: Record<string, Doc>) {
    const refs = (v: any, out: string[] = []) => {
      if (Array.isArray(v)) v.forEach((x) => refs(x, out));
      else if (v && typeof v === "object") {
        if (typeof v._ref === "string") out.push(v._ref);
        Object.values(v).forEach((x) => refs(x, out));
      }
      return out;
    };
    for (const d of Object.values(docs))
      for (const r of refs(d))
        if (!(docs as any)[r]) throw Object.assign(new Error(`Document "${d._id}" references non-existent/deleted document "${r}"`), { statusCode: 409, integrity: true });
  }
  async create(doc: Doc) {
    if (this.docs[doc._id]) throw new Error("already exists");
    const id = doc._id ?? `gen${this.rev}`;
    const next = { ...this.docs, [id]: { _rev: `r${this.rev++}`, ...doc, _id: id } };
    this.assertIntegrity(next);
    this.docs = next;
    return (next as any)[id];
  }
  async createIfNotExists(doc: Doc) {
    if (this.docs[doc._id]) return this.docs[doc._id];
    return this.create(doc);
  }
  applyAtomically(patches: Array<{ id: string; ops?: Ops; del?: boolean }>) {
    this.beforeCommit?.();
    this.commits++;
    const copy = structuredClone(this.docs);
    const touched = new Set<string>();
    for (const { id, ops = {}, del } of patches) {
      if (del) {
        delete copy[id];
        continue;
      }
      const d = copy[id];
      if (!d) throw Object.assign(new Error(`Document "${id}" not found`), { statusCode: 404 });
      if (ops.ifRevisionID !== undefined && ops.ifRevisionID !== this.docs[id]._rev)
        throw Object.assign(new Error("unexpected revision ID"), { statusCode: 409 });
      for (const [k, v] of Object.entries(ops.setIfMissing ?? {})) if (d[k] == null) d[k] = structuredClone(v);
      for (const [k, v] of Object.entries(ops.set ?? {})) d[k] = structuredClone(v);
      for (const [k, v] of Object.entries(ops.inc ?? {})) d[k] = (d[k] ?? 0) + v;
      for (const [k, v] of Object.entries(ops.dec ?? {})) d[k] = (d[k] ?? 0) - v;
      for (const path of ops.unset ?? []) {
        const m = path.match(/^(\w+)\[_ref == "(.+)"\]$/);
        if (m && Array.isArray(d[m[1]])) d[m[1]] = d[m[1]].filter((x: any) => x._ref !== m[2]);
      }
      if (ops.insert) {
        const field = ops.insert.after.replace(/\[-1\]$/, "");
        if (!Array.isArray(d[field])) throw new Error(`insert: ${field} no es un arreglo`);
        d[field].push(...structuredClone(ops.insert.items));
      }
      touched.add(id);
    }
    for (const id of touched) if (copy[id]) copy[id]._rev = `r${this.rev++}`;
    this.assertIntegrity(copy);
    this.docs = copy;
  }
}

class FakePatch {
  ops: Ops = {};
  constructor(public id: string) {}
  ifRevisionId(r: string) { this.ops.ifRevisionID = r; return this; }
  set(v: any) { this.ops.set = { ...this.ops.set, ...v }; return this; }
  setIfMissing(v: any) { this.ops.setIfMissing = { ...this.ops.setIfMissing, ...v }; return this; }
  inc(v: any) { this.ops.inc = { ...this.ops.inc, ...v }; return this; }
  dec(v: any) { this.ops.dec = { ...this.ops.dec, ...v }; return this; }
  unset(v: string[]) { this.ops.unset = [...(this.ops.unset ?? []), ...v]; return this; }
  // REAL: el 2º append reemplaza al 1º (así se perdía el historial)
  append(field: string, items: any[]) { this.ops.insert = { after: `${field}[-1]`, items }; return this; }
  async commit() { fakeOf(this).applyAtomically([{ id: this.id, ops: this.ops }]); }
}

let current: FakeSanity;
const fakeOf = (_: any) => current;

class FakeTx {
  items: Array<{ id: string; ops?: Ops; del?: boolean }> = [];
  constructor(private s: FakeSanity) {}
  patch(id: string, arg: ((p: FakePatch) => FakePatch) | Ops) {
    if (typeof arg === "function") this.items.push({ id, ops: arg(new FakePatch(id)).ops });
    else this.items.push({ id, ops: arg });
    return this;
  }
  delete(id: string) { this.items.push({ id, del: true }); return this; }
  async commit() { this.s.applyAtomically(this.items); }
}

export function createFake() {
  current = new FakeSanity();
  return current;
}
