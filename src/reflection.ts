// This file is essentially a clone of upstream flatbuffers code which
// uses different (less-restrictive) linters.
/* eslint no-underscore-dangle: 0 */
/* eslint no-restricted-syntax: 0 */
/* eslint @foxglove/strict-equality: 0 */
/* eslint @foxglove/no-boolean-parameters: 0 */
/* eslint @typescript-eslint/switch-exhaustiveness-check: 0 */
/* eslint @typescript-eslint/restrict-plus-operands: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */

// This library provides a few basic reflection utilities for Flatbuffers.
// Currently, this only really supports the level of reflection that would
// be necessary to convert a serialized flatbuffer to JSON using just a
// reflection.Schema flatbuffer describing the type.
// See tests/reflection.test.ts for sample usage.

import { ByteBuffer } from "flatbuffers";

import * as reflection from "./vendor/gen/reflection";

// Returns the size, in bytes, of the given type. For vectors/strings/etc.
// returns the size of the offset.
function typeSize(baseType: reflection.BaseType): number {
  switch (baseType) {
    case reflection.BaseType.None:
    case reflection.BaseType.UType:
    case reflection.BaseType.Bool:
    case reflection.BaseType.Byte:
    case reflection.BaseType.UByte:
      return 1;
    case reflection.BaseType.Short:
    case reflection.BaseType.UShort:
      return 2;
    case reflection.BaseType.Int:
    case reflection.BaseType.UInt:
      return 4;
    case reflection.BaseType.Long:
    case reflection.BaseType.ULong:
      return 8;
    case reflection.BaseType.Float:
      return 4;
    case reflection.BaseType.Double:
      return 8;
    case reflection.BaseType.String:
    case reflection.BaseType.Vector:
    case reflection.BaseType.Obj:
    case reflection.BaseType.Union:
    case reflection.BaseType.Array:
      return 4;
  }
  return NaN;
}

// Returns whether the given type is a scalar type.
function isScalar(baseType: reflection.BaseType): boolean {
  switch (baseType) {
    case reflection.BaseType.UType:
    case reflection.BaseType.Bool:
    case reflection.BaseType.Byte:
    case reflection.BaseType.UByte:
    case reflection.BaseType.Short:
    case reflection.BaseType.UShort:
    case reflection.BaseType.Int:
    case reflection.BaseType.UInt:
    case reflection.BaseType.Long:
    case reflection.BaseType.ULong:
    case reflection.BaseType.Float:
    case reflection.BaseType.Double:
      return true;
    case reflection.BaseType.None:
    case reflection.BaseType.String:
    case reflection.BaseType.Vector:
    case reflection.BaseType.Obj:
    case reflection.BaseType.Union:
    case reflection.BaseType.Array:
      return false;
  }
  return false;
}

// Stores the data associated with a Table within a given buffer.
export class Table {
  // Wrapper to represent an object (Table or Struct) within a ByteBuffer.
  // The ByteBuffer is the raw data associated with the object.
  // typeIndex is an index into the schema object vector for the parser
  // object that this is associated with.
  // offset is the absolute location within the buffer where the root of the
  // object is.
  // isStruct indicates whether the object in question is a flatbuffers struct
  //   or table (this is relevant for doing some memory bounds checks).
  // Note that a given Table assumes that it is being used with a particular
  // Schema object.
  // External users should generally not be using this constructor directly.
  constructor(
    public readonly bb: ByteBuffer,
    public readonly typeIndex: number,
    public readonly offset: number,
    public readonly isStruct: boolean,
  ) {
    // See https://flatbuffers.dev/md__internals.html for format details.

    // Check that the table could plausibly fit in bounds
    if (offset < 0 || offset + 4 > bb.capacity()) {
      throw new Error(
        `Attempt to construct Table with offset ${offset}, which would extend beyond ByteBuffer (capacity ${bb.capacity()})`,
      );
    }
    if (isStruct) {
      // If this is a struct, we don't have a vtable, so the below checks don't
      // apply.
      return;
    }
    // Check that the table's vtable could fit in bounds
    const offsetToVtable = bb.readInt32(offset);
    const vtableOffset = offset - offsetToVtable;
    const vtableMinSize = 2 * 2; // 2x uint16: vtable size and object size
    if (vtableOffset < 0 || vtableOffset + vtableMinSize > bb.capacity()) {
      throw new Error(
        `Table at offset ${offset} points to vtable at ${vtableOffset} (${offset} - ${offsetToVtable}), which would extend beyond the ByteBuffer (capacity ${bb.capacity()})`,
      );
    }

    // The vtable's first entry is the size of the vtable itself; check that it fits in bounds.
    const vtableActualSize = bb.readUint16(vtableOffset);
    if (vtableActualSize < 4) {
      throw new Error(
        `Table at offset ${offset} points to vtable at ${vtableOffset} (${offset} - ${offsetToVtable}), which specifies vtable size ${vtableActualSize}, which should be at least 4 (vtable size + object size)`,
      );
    }
    if (vtableOffset + vtableActualSize > bb.capacity()) {
      throw new Error(
        `Table at offset ${offset} points to vtable at ${vtableOffset} (${offset} - ${offsetToVtable}), which specifies vtable size ${vtableActualSize}, which would extend beyond the ByteBuffer (capacity ${bb.capacity()})`,
      );
    }

    // The vtable's second entry is the size of the table's inline fields; check that it fits in bounds.
    const objectSize = bb.readUint16(vtableOffset + 2);
    if (objectSize < 4) {
      throw new Error(
        `Table at offset ${offset} points to vtable at ${vtableOffset} (${offset} - ${offsetToVtable}), which specifies inline object size ${objectSize}, which should be at least 4 (vtable offset)`,
      );
    }
    if (offset + objectSize > bb.capacity()) {
      throw new Error(
        `Table at offset ${offset} points to vtable at ${vtableOffset} (${offset} - ${offsetToVtable}), which specifies inline object size ${objectSize}, which would extend beyond the ByteBuffer (capacity ${bb.capacity()})`,
      );
    }
  }

  // Constructs a Table object for the root of a ByteBuffer--this assumes that
  // the type of the Table is the root table of the Parser that you are using.
  // This assumes that the root table is a flatbuffers table, not a struct.
  static getRootTable(bb: ByteBuffer): Table {
    if (bb.position() + 4 > bb.capacity()) {
      throw new Error(
        `Attempt to parse root table offset from ${bb.position()}, which would extend beyond ByteBuffer (capacity ${bb.capacity()})`,
      );
    }
    // Additional bounds checks happen in the Table constructor
    return new Table(bb, -1, bb.readUint32(bb.position()) + bb.position(), false);
  }
  // Constructs a table from a type name instead of from a type index.
  static getNamedTable(
    bb: ByteBuffer,
    schema: reflection.Schema,
    type: string,
    offset?: number,
  ): Table {
    for (let ii = 0; ii < schema.objectsLength(); ++ii) {
      const schemaObject = schema.objects(ii);
      if (schemaObject !== null && schemaObject.name() === type) {
        return new Table(
          bb,
          ii,
          offset ?? bb.readUint32(bb.position()) + bb.position(),
          schemaObject.isStruct(),
        );
      }
    }
    throw new Error("Unable to find type " + type + " in schema.");
  }
  // Reads a scalar of a given type at a given offset.
  readScalar(fieldType: reflection.BaseType, offset: number): number | bigint | boolean {
    const size = typeSize(fieldType);
    if (offset < 0 || offset + size > this.bb.capacity()) {
      throw new Error(
        `Attempt to read scalar type ${fieldType} (size ${size}) at offset ${offset}, which would extend beyond ByteBuffer (capacity ${this.bb.capacity()})`,
      );
    }
    switch (fieldType) {
      case reflection.BaseType.Bool:
        return this.bb.readUint8(offset) !== 0;
      case reflection.BaseType.Byte:
        return this.bb.readInt8(offset);
      case reflection.BaseType.UType:
      case reflection.BaseType.UByte:
        return this.bb.readUint8(offset);
      case reflection.BaseType.Short:
        return this.bb.readInt16(offset);
      case reflection.BaseType.UShort:
        return this.bb.readUint16(offset);
      case reflection.BaseType.Int:
        return this.bb.readInt32(offset);
      case reflection.BaseType.UInt:
        return this.bb.readUint32(offset);
      case reflection.BaseType.Long:
        return this.bb.readInt64(offset);
      case reflection.BaseType.ULong:
        return this.bb.readUint64(offset);
      case reflection.BaseType.Float:
        return this.bb.readFloat32(offset);
      case reflection.BaseType.Double:
        return this.bb.readFloat64(offset);
    }
    throw new Error(`Unsupported message type ${fieldType}`);
  }
}

// The Parser class uses a Schema to provide all the utilities required to
// parse flatbuffers that have a type that is the same as the root_type defined
// by the Schema.
// The classical usage would be to, e.g., be reading a channel with a type of
// "foo.Bar". At startup, you would construct a Parser from the channel's
// Schema. When a message is received on the channel , you would then use
// Table.getRootTable() on the received buffer to construct the Table, and
// then access the members using the various methods of the Parser (or just
// convert the entire object to a javascript Object/JSON using toObject()).
// There are three basic ways to access fields in a Table:
// 1) Call toObject(), which turns the entire table into a javascript object.
//    This is not meant to be particularly fast, but is useful to, e.g.,
//    convert something to JSON, or as a debugging tool.
// 2) Call toObjectLambda() to get a function that lets you do the same thing
//    as toObject(), except that it preloads all the reflection-related work.
//    Note that this still deserializes the entire object, which may be
//    overkill for your application if you care about performance.
// 2) Use the read*Lambda() accessors: These return a function that lets you
//    access the specified field given a table. This is used by the plotter
//    to repeatedly access the same field on a bunch of tables of the same type,
//    without having to redo all the reflection-related work on every access.
// 3) Use the read*() accessors: These just call the lambda returned by
//    read*Lambda() for you, as a convenience. This is cleaner to use, but for
//    repeated lookups on tables of the same type, this may be inefficient.
export class Parser {
  constructor(private readonly schema: reflection.Schema) {}

  toObjectLambda(typeIndex: number, readDefaults = false): (t: Table) => Record<string, any> {
    const schema = this.getType(typeIndex);
    const numFields = schema.fieldsLength();

    const fieldLambdas: {
      id: number;
      fieldName: string;
      readField: ((t: Table) => unknown) | undefined;
    }[] = [];
    for (let i = 0; i < numFields; ++i) {
      const field = schema.fields(i);
      if (field === null) {
        throw new Error(`Malformed schema: field at index ${i} not populated.`);
      }
      const fieldName = field.name();
      if (fieldName === null) {
        throw new Error('Malformed schema: "name" field of Field not populated.');
      }
      fieldLambdas.push({
        fieldName,
        id: field.id(),
        readField: this.readFieldLambda(schema, field, typeIndex, readDefaults),
      });
    }

    // Sort fields by ID so the resulting object is built with fields in this order.
    // This tends to correspond with the order in the original .fbs (unless ids were specified manually).
    fieldLambdas.sort((a, b) => a.id - b.id);

    return (t: Table) => {
      const obj: Record<string, any> = {};
      // Go through and attempt to use every single field accessor; return the
      // resulting object.
      for (const { fieldName, readField } of fieldLambdas) {
        const value = readField?.(t);
        if (value !== null) {
          obj[fieldName] = value;
        }
      }
      return obj;
    };
  }

  readFieldLambda(
    schema: reflection.Object_,
    field: reflection.Field,
    typeIndex: number,
    readDefaults = false,
  ): ((t: Table) => unknown) | undefined {
    const fieldType = field.type();
    if (fieldType === null) {
      throw new Error('Malformed schema: "type" field of Field not populated.');
    }
    const fieldName = field.name();
    if (fieldName === null) {
      throw new Error('Malformed schema: "name" field of Field not populated.');
    }
    const baseType = fieldType.baseType();
    if (isScalar(baseType)) {
      return this.readScalarLambda(field, typeIndex, readDefaults);
    } else if (baseType === reflection.BaseType.String) {
      return this.readStringLambda(field);
    } else if (baseType === reflection.BaseType.Obj) {
      const rawLambda = this.readTableLambda(field, typeIndex);
      const subTableLambda = this.toObjectLambda(fieldType.index(), readDefaults);
      return (t: Table) => {
        const subTable = rawLambda(t);
        if (subTable === null) {
          return null;
        }
        return subTableLambda(subTable);
      };
    } else if (baseType === reflection.BaseType.Vector) {
      const elementType = fieldType.element();
      if (isScalar(elementType)) {
        return this.readVectorOfScalarsLambda(field);
      } else if (elementType === reflection.BaseType.String) {
        return this.readVectorOfStringsLambda(field);
      } else if (elementType === reflection.BaseType.Obj) {
        const vectorLambda = this.readVectorOfTablesLambda(field);
        const subTableLambda = this.toObjectLambda(fieldType.index(), readDefaults);
        return (t: Table) => {
          const vector = vectorLambda(t);
          if (vector === null) {
            return null;
          }
          const result = [];
          for (const table of vector) {
            result.push(subTableLambda(table));
          }
          return result;
        };
      } else if (elementType === reflection.BaseType.Union) {
        // Similar to how a union is serialized in a table, a vector of union gets a sidecar field
        // that is an array of discriminator values. This sidecar field is named as the union field
        // with _type suffix
        //
        // https://flatbuffers.dev/md__schemas.html

        const discriminatorFieldName = `${fieldName}_type`;
        const unionDiscriminator = this.getField(discriminatorFieldName, typeIndex);

        return this.readVectorOfUnionsLambda(field, unionDiscriminator, readDefaults);
      } else {
        throw new Error("Vectors of Arrays are not supported.");
      }
    } else if (baseType === reflection.BaseType.Union) {
      // A union gets a sidecar field that is the discriminator value. This sidecar field is named
      // as the union field with _type suffix.
      //
      // https://flatbuffers.dev/md__schemas.html

      const discriminatorFieldName = `${fieldName}_type`;
      const unionDiscriminator = this.getField(discriminatorFieldName, typeIndex);

      return this.readUnionLambda(field, unionDiscriminator, typeIndex, readDefaults);
    } else if (baseType === reflection.BaseType.Array) {
      if (!schema.isStruct()) {
        throw new Error("Arrays are only supported inside structs, not tables");
      }
      const elementType = fieldType.element();
      if (isScalar(elementType)) {
        return this.readArrayOfScalarsLambda(field);
      } else if (elementType === reflection.BaseType.Obj) {
        return this.readArrayOfStructsLambda(field, readDefaults);
      } else {
        throw new Error("Arrays may contain only scalar or struct fields");
      }
    }

    throw new Error(
      `Unsupported BaseType ${reflection.BaseType[baseType as number] ?? "unknown"} (${baseType})`,
    );
  }

  // Parse a Table to a javascript object. This is can be used, e.g., to convert
  // a flatbuffer Table to JSON.
  // If readDefaults is set to true, then scalar fields will be filled out with
  // their default values if not populated; if readDefaults is false and the
  // field is not populated, the resulting object will not populate the field.
  toObject(table: Table, readDefaults = false): Record<string, any> {
    return this.toObjectLambda(table.typeIndex, readDefaults)(table);
  }

  // Returns the Object definition associated with the given type index.
  getType(typeIndex: number): reflection.Object_ {
    if (typeIndex === -1) {
      const rootTable = this.schema.rootTable();
      if (rootTable === null) {
        throw new Error("Malformed schema: No root table.");
      }
      return rootTable;
    }
    if (typeIndex < 0 || typeIndex > this.schema.objectsLength()) {
      throw new Error("Type index out-of-range.");
    }
    const table = this.schema.objects(typeIndex);
    if (table === null) {
      throw new Error("Malformed schema: No object at index " + typeIndex + ".");
    }
    return table;
  }

  // Retrieves the Field schema for the given field name within a given
  // type index.
  getField(fieldName: string, typeIndex: number): reflection.Field {
    const schema: reflection.Object_ = this.getType(typeIndex);
    const numFields = schema.fieldsLength();
    for (let ii = 0; ii < numFields; ++ii) {
      const field = schema.fields(ii);
      if (field === null) {
        throw new Error("Malformed schema: Missing Field table at index " + ii + ".");
      }
      const name = field.name();
      if (fieldName === name) {
        return field;
      }
    }
    throw new Error("Couldn't find field " + fieldName + " in object " + schema.name() + ".");
  }

  // Reads a scalar with the given field name from a Table. If readDefaults
  // is set to false and the field is unset, we will return null. If
  // readDefaults is true and the field is unset, we will look-up the default
  // value for the field and return that.
  // For 64-bit fields, returns a BigInt rather than a standard number.
  readScalar(
    table: Table,
    fieldName: string,
    readDefaults = false,
  ): number | bigint | boolean | null {
    const field = this.getField(fieldName, table.typeIndex);
    return this.readScalarLambda(field, table.typeIndex, readDefaults)(table);
  }

  // Like readScalar(), except that this returns an accessor for the specified
  // field, rather than the value of the field itself.
  // Note that the *Lambda() methods take a typeIndex instead of a Table, which
  // can be obtained using table.typeIndex.
  readScalarLambda(
    field: reflection.Field,
    typeIndex: number,
    readDefaults = false,
  ): (t: Table) => number | bigint | boolean | null {
    const fieldType = field.type();
    if (fieldType === null) {
      throw new Error('Malformed schema: "type" field of Field not populated.');
    }
    const isStruct = this.getType(typeIndex).isStruct();
    if (!isScalar(fieldType.baseType())) {
      throw new Error("Field " + field.name() + " is not a scalar type.");
    }

    if (isStruct) {
      const baseType = fieldType.baseType();
      return (t: Table) => {
        return t.readScalar(baseType, t.offset + field.offset());
      };
    }

    return (t: Table) => {
      const offset = t.offset + t.bb.__offset(t.offset, field.offset());
      if (offset === t.offset) {
        if (!readDefaults) {
          return null;
        }
        switch (fieldType.baseType()) {
          case reflection.BaseType.Bool:
            return field.defaultInteger() !== 0n;
          case reflection.BaseType.Long:
          case reflection.BaseType.ULong:
            return field.defaultInteger();
          case reflection.BaseType.UType:
          case reflection.BaseType.Byte:
          case reflection.BaseType.UByte:
          case reflection.BaseType.Short:
          case reflection.BaseType.UShort:
          case reflection.BaseType.Int:
          case reflection.BaseType.UInt:
            return Number(field.defaultInteger());
          case reflection.BaseType.Float:
          case reflection.BaseType.Double:
            return field.defaultReal();
          default:
            throw new Error(`Expected scalar type, found ${fieldType.baseType()}`);
        }
      }
      return t.readScalar(fieldType.baseType(), offset);
    };
  }
  // Reads a string with the given field name from the provided Table.
  // If the field is unset, returns null.
  readString(table: Table, fieldName: string): string | null {
    const field = this.getField(fieldName, table.typeIndex);
    return this.readStringLambda(field)(table);
  }

  readStringLambda(field: reflection.Field): (t: Table) => string | null {
    const fieldType = field.type();
    if (fieldType === null) {
      throw new Error('Malformed schema: "type" field of Field not populated.');
    }
    if (fieldType.baseType() !== reflection.BaseType.String) {
      throw new Error("Field " + field.name() + " is not a string.");
    }

    return (t: Table) => {
      const offsetToOffset = t.offset + t.bb.__offset(t.offset, field.offset());
      if (offsetToOffset === t.offset) {
        return null;
      }
      return t.bb.__string(offsetToOffset) as string;
    };
  }
  // Reads a sub-message from the given Table. The sub-message may either be
  // a struct or a Table. Returns null if the sub-message is not set.
  readTable(table: Table, fieldName: string): Table | null {
    const field = this.getField(fieldName, table.typeIndex);
    return this.readTableLambda(field, table.typeIndex)(table);
  }
  readTableLambda(field: reflection.Field, typeIndex: number): (t: Table) => Table | null {
    const fieldType = field.type();
    if (fieldType === null) {
      throw new Error('Malformed schema: "type" field of Field not populated.');
    }
    if (fieldType.baseType() !== reflection.BaseType.Obj) {
      throw new Error("Field " + field.name() + " is not an object type.");
    }

    const parentIsStruct = this.getType(typeIndex).isStruct();
    const elementIsStruct = this.getType(fieldType.index()).isStruct();

    if (parentIsStruct) {
      return (t: Table) => {
        return new Table(t.bb, fieldType.index(), t.offset + field.offset(), elementIsStruct);
      };
    }

    return (table: Table) => {
      const offsetToOffset = table.offset + table.bb.__offset(table.offset, field.offset());
      if (offsetToOffset === table.offset) {
        return null;
      }

      const objectStart = elementIsStruct ? offsetToOffset : table.bb.__indirect(offsetToOffset);
      return new Table(table.bb, fieldType.index(), objectStart, elementIsStruct);
    };
  }
  // Reads a vector of scalars (like readScalar, may return a vector of BigInt's
  // instead). Also, will return null if the vector is not set.
  readVectorOfScalars(
    table: Table,
    fieldName: string,
  ): (number | bigint | boolean)[] | Uint8Array | null {
    const field = this.getField(fieldName, table.typeIndex);
    return this.readVectorOfScalarsLambda(field)(table);
  }

  readVectorOfScalarsLambda(
    field: reflection.Field,
  ): (t: Table) => (number | bigint | boolean)[] | Uint8Array | null {
    const fieldType = field.type();
    if (fieldType === null) {
      throw new Error('Malformed schema: "type" field of Field not populated.');
    }
    if (fieldType.baseType() !== reflection.BaseType.Vector) {
      throw new Error("Field " + field.name() + " is not an vector.");
    }
    const elementType = fieldType.element();
    if (!isScalar(elementType)) {
      throw new Error("Field " + field.name() + " is not a vector of scalars.");
    }
    const isUByteVector = elementType === reflection.BaseType.UByte;

    return (table: Table) => {
      const offsetToOffset = table.offset + table.bb.__offset(table.offset, field.offset());
      if (offsetToOffset === table.offset) {
        return null;
      }

      const numElements = table.bb.__vector_len(offsetToOffset);
      const baseOffset = table.bb.__vector(offsetToOffset);
      const scalarSize = typeSize(fieldType.element());

      let result: (number | bigint | boolean)[] | Uint8Array;
      // If the vector is a byte vector, we can return a slice into the buffer
      if (isUByteVector) {
        result = new Uint8Array(
          table.bb.bytes().buffer,
          table.bb.bytes().byteOffset + baseOffset,
          numElements,
        );
      } else {
        result = [];
        for (let ii = 0; ii < numElements; ++ii) {
          result.push(table.readScalar(fieldType.element(), baseOffset + scalarSize * ii));
        }
      }
      return result;
    };
  }
  // Reads a vector of tables. Returns null if vector is not set.
  readVectorOfTables(table: Table, fieldName: string): Table[] | null {
    const field = this.getField(fieldName, table.typeIndex);
    return this.readVectorOfTablesLambda(field)(table);
  }
  readVectorOfTablesLambda(field: reflection.Field): (t: Table) => Table[] | null {
    const fieldType = field.type();
    if (fieldType === null) {
      throw new Error('Malformed schema: "type" field of Field not populated.');
    }
    if (fieldType.baseType() !== reflection.BaseType.Vector) {
      throw new Error("Field " + field.name() + " is not an vector.");
    }
    if (fieldType.element() !== reflection.BaseType.Obj) {
      throw new Error("Field " + field.name() + " is not a vector of objects");
    }

    const elementSchema = this.getType(fieldType.index());
    const elementIsStruct = elementSchema.isStruct();
    const elementSize = elementIsStruct ? elementSchema.bytesize() : typeSize(fieldType.element());

    return (table: Table) => {
      const offsetToOffset = table.offset + table.bb.__offset(table.offset, field.offset());
      if (offsetToOffset === table.offset) {
        return null;
      }
      const numElements = table.bb.__vector_len(offsetToOffset);
      const result = [];
      const baseOffset = table.bb.__vector(offsetToOffset);
      for (let ii = 0; ii < numElements; ++ii) {
        const elementOffset = baseOffset + elementSize * ii;
        result.push(
          new Table(
            table.bb,
            fieldType.index(),
            elementIsStruct ? elementOffset : table.bb.__indirect(elementOffset),
            elementIsStruct,
          ),
        );
      }
      return result;
    };
  }
  // Reads a vector of strings. Returns null if not set.
  readVectorOfStrings(table: Table, fieldName: string): string[] | null {
    const field = this.getField(fieldName, table.typeIndex);
    return this.readVectorOfStringsLambda(field)(table);
  }
  readVectorOfStringsLambda(field: reflection.Field): (t: Table) => string[] | null {
    const fieldType = field.type();
    if (fieldType === null) {
      throw new Error('Malformed schema: "type" field of Field not populated.');
    }
    if (fieldType.baseType() !== reflection.BaseType.Vector) {
      throw new Error("Field " + field.name() + " is not an vector.");
    }
    if (fieldType.element() !== reflection.BaseType.String) {
      throw new Error("Field " + field.name() + " is not an vector of strings.");
    }

    return (table: Table) => {
      const offsetToOffset = table.offset + table.bb.__offset(table.offset, field.offset());
      if (offsetToOffset === table.offset) {
        return null;
      }
      const numElements = table.bb.__vector_len(offsetToOffset);
      const result = [];
      const baseOffset = table.bb.__vector(offsetToOffset);
      const offsetSize = typeSize(fieldType.element());
      for (let ii = 0; ii < numElements; ++ii) {
        result.push(table.bb.__string(baseOffset + offsetSize * ii) as string);
      }
      return result;
    };
  }

  readArrayOfScalarsLambda(
    field: reflection.Field,
  ): (t: Table) => Array<number | bigint | boolean> {
    const fieldType = field.type();
    if (fieldType === null) {
      throw new Error('Malformed schema: "type" field of Field not populated.');
    }
    const arrayLength = fieldType.fixedLength();
    const elementType = fieldType.element();
    const fieldOffset = field.offset();
    const elementSize = typeSize(elementType);
    return (t: Table) => {
      if (!t.isStruct) {
        throw new Error("Arrays are only supported inside structs, not tables");
      }
      const result = new Array<number | bigint | boolean>(arrayLength);
      let offset = t.offset + fieldOffset;
      for (let i = 0; i < arrayLength; i++) {
        result[i] = t.readScalar(elementType, offset);
        offset += elementSize;
      }
      return result;
    };
  }

  readArrayOfStructsLambda(
    field: reflection.Field,
    readDefaults: boolean,
  ): (t: Table) => Array<Record<string, any>> {
    const fieldType = field.type();
    if (fieldType === null) {
      throw new Error('Malformed schema: "type" field of Field not populated.');
    }
    const arrayLength = fieldType.fixedLength();
    const fieldOffset = field.offset();
    const fieldTypeIndex = fieldType.index();
    const elementSchema = this.getType(fieldTypeIndex);
    if (!elementSchema.isStruct()) {
      throw new Error("Arrays may only contain structs, not tables");
    }
    const elementSize = elementSchema.bytesize();
    const subTableLambda = this.toObjectLambda(fieldTypeIndex, readDefaults);
    return (t: Table) => {
      if (!t.isStruct) {
        throw new Error("Arrays are only supported inside structs, not tables");
      }
      const result = new Array<Record<string, any>>(arrayLength);
      let offset = t.offset + fieldOffset;
      for (let i = 0; i < arrayLength; i++) {
        const subTable = new Table(t.bb, fieldTypeIndex, offset, true);
        result[i] = subTableLambda(subTable);
        offset += elementSize;
      }
      return result;
    };
  }

  readVectorOfUnionsLambda(
    field: reflection.Field,
    discriminatorField: reflection.Field,
    readDefaults: boolean,
  ): (table: Table) => (Record<string, any> | undefined)[] | null {
    const fieldType = field.type();
    if (fieldType === null) {
      throw new Error(`Malformed schema: "type" field of '${field.name()}' not populated.`);
    }

    if (discriminatorField.type()?.baseType() !== reflection.BaseType.Vector) {
      throw new Error(`Malformed schema: union discriminator field is not a vector`);
    }

    // This will deserialize the vector of discriminator values
    const readDiscriminators = this.readVectorOfScalarsLambda(discriminatorField);

    // enum value -> specific type information
    const specificTypes = new Map<
      number,
      { typeIndex: number; deserializer: (table: Table) => Record<string, any> | undefined }
    >();

    for (const [enumVal, type] of this.getUnionTypes(fieldType)) {
      const specificTypeIndex = type.index();

      const typeDeserializer = this.toObjectLambda(specificTypeIndex, readDefaults);
      specificTypes.set(enumVal, {
        typeIndex: specificTypeIndex,
        deserializer: typeDeserializer,
      });
    }

    return (table: Table) => {
      const discriminators = readDiscriminators(table);
      if (!discriminators) {
        return null;
      }

      const offsetToOffset = table.offset + table.bb.__offset(table.offset, field.offset());
      if (offsetToOffset === table.offset) {
        throw new Error(
          `Malformed message: missing vector table for field: ${field.name()} despite the discriminator vector being present.`,
        );
      }

      const numElements = table.bb.__vector_len(offsetToOffset);
      if (discriminators.length !== numElements) {
        throw new Error(
          `malformed message: ${field.name()} length != ${discriminatorField.name()} length`,
        );
      }

      const result = [];
      // Track the offset of the next table element in the vector.
      let nextTableOffset = table.bb.__vector(offsetToOffset); // start with base offset
      for (let idx = 0; idx < numElements; ++idx) {
        const discriminator = discriminators[idx];
        if (typeof discriminator !== "number") {
          throw new Error(
            `Malformed union discriminator value is not a number in field: ${discriminatorField.name()}`,
          );
        }

        // NONE becomes an undefined slot in the array because the values array is should match the
        // discriminators length
        if (discriminator <= 0) {
          result.push(undefined);
          continue;
        }

        const specificTypeInfo = specificTypes.get(discriminator);
        if (!specificTypeInfo) {
          throw new Error(
            `Malformed message: unknown union type '${discriminator}' in field ${discriminatorField.name()}`,
          );
        }

        const subTable = new Table(
          table.bb,
          specificTypeInfo.typeIndex,
          table.bb.__indirect(nextTableOffset),
          false /* elementIsStruct */,
        );

        // In a vector of union, each "element" is an object until we re-visit struct
        // support
        nextTableOffset += typeSize(reflection.BaseType.Obj);
        result.push(specificTypeInfo.deserializer(subTable));
      }

      return result;
    };
  }

  readUnionLambda(
    field: reflection.Field,
    discriminatorField: reflection.Field,
    typeIndex: number,
    readDefaults: boolean,
  ): (table: Table) => Record<string, any> | undefined {
    const fieldType = field.type();
    if (fieldType == null) {
      throw new Error(`Malformed schema: "type" field of '${field.name()}' not populated.`);
    }

    const discriminatorfieldType = discriminatorField.type();
    if (discriminatorfieldType === null) {
      throw new Error('Malformed schema: "type" field of Field not populated.');
    }

    if (!isScalar(discriminatorfieldType.baseType())) {
      throw new Error(`Malformed schema: union discriminator field is not a scalar`);
    }

    const parseDiscriminator = this.readScalarLambda(discriminatorField, typeIndex, readDefaults);

    const fieldOffset = field.offset();

    const unionDeserializers = new Map<number, (table: Table) => Record<string, any> | undefined>();

    for (const [enumVal, type] of this.getUnionTypes(fieldType)) {
      const specificTypeIndex = type.index();

      const typeDeserializer = this.toObjectLambda(specificTypeIndex, readDefaults);
      const deserializer = (table: Table) => {
        const offsetToOffset = table.offset + table.bb.__offset(table.offset, fieldOffset);
        if (offsetToOffset === table.offset) {
          return undefined;
        }

        const subTable = new Table(
          table.bb,
          specificTypeIndex,
          table.bb.__indirect(offsetToOffset),
          false /* elementIsStruct */,
        );
        return typeDeserializer(subTable);
      };

      unionDeserializers.set(enumVal, deserializer);
    }

    return (table: Table) => {
      const discriminatorValue = parseDiscriminator(table);
      // NONE becomes undefined when parsed
      if (discriminatorValue == undefined) {
        return undefined;
      }
      if (typeof discriminatorValue !== "number") {
        throw new Error(`Malformed union discriminator value is not a number`);
      }

      // Skip NONE
      if (discriminatorValue <= 0) {
        return undefined;
      }

      const deserializer = unionDeserializers.get(discriminatorValue);
      if (!deserializer) {
        throw new Error(`Malformed message: could not find union type: '${discriminatorValue}'`);
      }

      return deserializer(table);
    };
  }

  /**
   * Read the specific types of a union field into a map of enum value -> specific type
   *
   * Note: the _none_ enum value is not added since it has no specific type
   * */
  // eslint-disable-next-line @foxglove/prefer-hash-private
  private getUnionTypes(fieldType: reflection.Type) {
    const elementType =
      fieldType.baseType() === reflection.BaseType.Vector
        ? fieldType.element()
        : fieldType.baseType();

    if (elementType !== reflection.BaseType.Union) {
      throw new Error(`invariant: getUnionTypes called with incorrect base type: ${elementType}`);
    }

    // enum value -> specific type information
    const specificTypes = new Map<number, reflection.Type>();

    // For union types, the index points to the enum which has the valid types of the union
    const enumIndex = fieldType.index();

    const unionEnum = this.schema.enums(enumIndex);
    if (!unionEnum) {
      throw new Error("Malformed schema: missing enum for union type");
    }

    for (let eidx = 0; eidx < unionEnum.valuesLength(); ++eidx) {
      const enumItem = unionEnum.values(eidx);
      if (!enumItem) {
        throw new Error("Malformed schema: missing enum item");
      }

      const specificType = enumItem.unionType();
      if (!specificType) {
        throw new Error("Malformed schema: union enum missing unionType");
      }

      // The 0 (none) enum value has no type index and we skip adding it to the output
      const specificTypeIndex = specificType.index();
      if (specificTypeIndex < 0) {
        continue;
      }

      const elementIsStruct = this.getType(specificTypeIndex).isStruct();
      if (elementIsStruct) {
        throw new Error("Union with struct element is not currently supported");
      }

      specificTypes.set(Number(enumItem.value()), specificType);
    }

    return specificTypes;
  }
}
