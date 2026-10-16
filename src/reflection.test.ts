/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Builder, ByteBuffer } from "flatbuffers";
import { readFileSync } from "fs";

import { Parser, Table } from "./reflection";
import {
  ArraysTable,
  ArraysTableT,
  Color,
  Mat3x3bT,
  Mat3x3dT,
  Mat3x3eT,
  Mat3x3fT,
  Mat3x3iT,
  Mat3x3lT,
  Mat3x3sT,
  Point3bT,
  Point3dT,
  Point3eT,
  Point3fT,
  Point3iT,
  Point3lT,
  Point3sT,
} from "./test/gen/ArraysTable";
import { ByteVector, NestedStruct } from "./test/gen/ByteVector";
import { OptionalScalar, OptionalScalarT } from "./test/gen/OptionalScalar";
import { ArmsT } from "./test/gen/arms";
import { Equipment } from "./test/gen/equipment";
import { GemstoneT } from "./test/gen/gemstone";
import { Kind } from "./test/gen/kind";
import { Monster, MonsterT } from "./test/gen/monster";
import { RockT } from "./test/gen/rock";
import { Shield, ShieldT } from "./test/gen/shield";
import { ShieldDecorator } from "./test/gen/shield-decorator";
import { SkullT } from "./test/gen/skull";
import { StructBT } from "./test/gen/struct-b";
import { UnionStruct, UnionStructT } from "./test/gen/union-struct";
import {
  BaseType,
  EnumVal,
  Field,
  FieldT,
  Schema,
  SchemaT,
  Type,
  TypeT,
} from "./vendor/gen/reflection";
import { Object_T } from "./vendor/gen/reflection/object";

describe("parseReflectionSchema", () => {
  it("Reads reflection table", () => {
    // Set up a test where we use the schema of the Schema type itself to test
    // the reflection library, because in practice the Schema type has ~all of
    // the interesting features that we support reflection for.
    const reflectionSchemaBuffer: Buffer = readFileSync(`${__dirname}/vendor/gen/reflection.bfbs`);
    const reflectionSchemaByteBuffer: ByteBuffer = new ByteBuffer(reflectionSchemaBuffer);
    const schema = Schema.getRootAsSchema(reflectionSchemaByteBuffer);
    const parser = new Parser(schema);
    const table = Table.getRootTable(reflectionSchemaByteBuffer);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const schemaObject = parser.toObject(table) as any;
    // Spot-check some individual features of the reflection schema. This
    // covers testing that we can read vectors of tables.
    expect(schemaObject["objects"].length).toEqual(schema.objectsLength());
    expect(schemaObject["objects"].length).toEqual(10);
    expect(schemaObject["objects"][0]!["name"]).toEqual("reflection.Enum");
    expect(schemaObject["file_ident"]).toEqual("BFBS");
    expect(schemaObject["file_ext"]).toEqual("bfbs");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(schemaObject["fbs_files"][0]["filename"].substr(-14)).toEqual("reflection.fbs");
    expect(schemaObject["fbs_files"][0]["included_filenames"].length).toEqual(0);

    // Test constructing a small object that specifically lets us exercise
    // some edge cases that the actual schema doesn't. Covered reflection
    // features:
    // * Reading numbers & BigInt's
    // * Vectors of strings
    // * Table fields
    // * Default scalars
    {
      const builder = new Builder();
      const docOffsets = [builder.createString("abc"), builder.createString("def")];
      const docVector = EnumVal.createDocumentationVector(builder, docOffsets);
      const nameOffset = builder.createString("name");
      Type.startType(builder);
      Type.addBaseType(builder, BaseType.Int);
      Type.addIndex(builder, 123);
      const typeOffset = Type.endType(builder);
      EnumVal.startEnumVal(builder);
      EnumVal.addName(builder, nameOffset);
      // Make sure that we are testing an integer that will exceed the normal
      // precision bounds.
      EnumVal.addValue(builder, BigInt(Number.MAX_SAFE_INTEGER) + 2n);
      EnumVal.addDocumentation(builder, docVector);
      EnumVal.addUnionType(builder, typeOffset);
      builder.finish(EnumVal.endEnumVal(builder));
      const array = builder.asUint8Array();
      const fbBuffer = new ByteBuffer(array);

      const enumTable = Table.getNamedTable(fbBuffer, schema, "reflection.EnumVal");
      expect(parser.toObject(enumTable)).toEqual({
        documentation: ["abc", "def"],
        name: "name",
        union_type: {
          base_type: 7,
          index: 123,
        },
        value: 9007199254740993n,
      });
      expect(parser.readScalar(enumTable, "value", false)).toBe(
        BigInt(Number.MAX_SAFE_INTEGER) + 2n,
      );
      const typeFb = parser.readTable(enumTable, "union_type");
      if (typeFb == null) {
        throw new Error();
      }
      expect(parser.readScalar(typeFb, "index", false)).toBe(123);
      // Confirm that readDefaults works.
      expect(parser.readScalar(typeFb, "base_size", true)).toBe(4);
      expect(parser.readScalar(typeFb, "base_size", false)).toBe(undefined);
    }
    {
      const builder = new Builder();
      Type.startType(builder);
      Type.addBaseType(builder, BaseType.Int);
      const typeOffset = Type.endType(builder);
      const nameOffset = builder.createString("name");
      Field.startField(builder);
      Field.addName(builder, nameOffset);
      Field.addType(builder, typeOffset);
      Field.addOptional(builder, true);
      builder.finish(Field.endField(builder));
      const array = builder.asUint8Array();
      const fbBuffer = new ByteBuffer(array);

      const fieldTable = Table.getNamedTable(fbBuffer, schema, "reflection.Field");
      expect(parser.readScalar(fieldTable, "deprecated", false)).toBe(undefined);
      expect(parser.readScalar(fieldTable, "deprecated", true)).toBe(false);
      expect(parser.readScalar(fieldTable, "optional")).toBe(true);
      expect(parser.readScalar(fieldTable, "default_integer", false)).toBe(undefined);
      expect(parser.readScalar(fieldTable, "default_integer", true)).toBe(0n);
      expect(parser.readScalar(fieldTable, "default_real", false)).toBe(undefined);
      expect(parser.readScalar(fieldTable, "default_real", true)).toBe(0);
      expect(parser.readScalar(fieldTable, "padding", false)).toBe(undefined);
      expect(parser.readScalar(fieldTable, "padding", true)).toBe(0);
    }
  });
  it("reads fields in order of id", () => {
    const reflectionSchemaBuffer: Buffer = readFileSync(`${__dirname}/vendor/gen/reflection.bfbs`);
    const reflectionSchemaByteBuffer: ByteBuffer = new ByteBuffer(reflectionSchemaBuffer);
    const schema = Schema.getRootAsSchema(reflectionSchemaByteBuffer);
    const parser = new Parser(schema);
    const table = Table.getRootTable(reflectionSchemaByteBuffer);
    const schemaObject = parser.toObject(table);
    expect(Object.keys(schemaObject)).toEqual([
      "objects",
      "enums",
      "file_ident",
      "file_ext",
      "root_table",
      "services",
      "fbs_files",
    ]);
  });
  it("supports union types", () => {
    const schemaBuffer: Buffer = readFileSync(`${__dirname}/test/gen/Union.bfbs`);
    const schemaByteBuffer: ByteBuffer = new ByteBuffer(schemaBuffer);
    const schema = Schema.getRootAsSchema(schemaByteBuffer);

    const monster = new MonsterT();

    monster.equippedType = Equipment.Shield;
    monster.equipped = new ShieldT();
    monster.equipped.protection = 27.5;
    monster.equipped.primaryDecorator = new ArmsT(12);
    monster.equipped.primaryDecoratorType = ShieldDecorator.Arms;

    const gemstone = new GemstoneT(1.02337);
    gemstone.rocks.push(new RockT(7), new RockT(95));

    monster.equipped.decorators.push(gemstone);
    monster.equipped.decorators.push(new SkullT("some-name"));
    monster.equipped.decoratorsType.push(ShieldDecorator.Gemstone);
    monster.equipped.decoratorsType.push(ShieldDecorator.Skull);

    const builder = new Builder();
    Monster.finishMonsterBuffer(builder, monster.pack(builder));

    const parser = new Parser(schema);
    const table = Table.getRootTable(new ByteBuffer(builder.asUint8Array()));
    const schemaObject = parser.toObject(table, true /* read defaults */);

    expect(schemaObject).toEqual({
      equipped_type: Equipment.Shield,
      equipped: {
        protection: 27.5,
        primary_decorator: { count: 12 },
        primary_decorator_type: ShieldDecorator.Arms,
        decorators: [
          { shine: 1.02337, rocks: [{ hardness: 7 }, { hardness: 95 }] },
          { name: "some-name" },
        ],
        decorators_type: [ShieldDecorator.Gemstone, ShieldDecorator.Skull],
      },
    });
  });
  it("supports union NONE", () => {
    const schemaBuffer: Buffer = readFileSync(`${__dirname}/test/gen/Union.bfbs`);
    const schemaByteBuffer: ByteBuffer = new ByteBuffer(schemaBuffer);
    const schema = Schema.getRootAsSchema(schemaByteBuffer);

    const monster = new MonsterT();

    monster.equippedType = Equipment.Shield;
    monster.equipped = new ShieldT();
    monster.equipped.protection = -27.5;
    monster.equipped.primaryDecoratorType = ShieldDecorator.NONE;

    monster.equipped.decorators.push(new GemstoneT(1.02337));
    monster.equipped.decoratorsType.push(ShieldDecorator.NONE);

    const builder = new Builder();
    Monster.finishMonsterBuffer(builder, monster.pack(builder));

    const parser = new Parser(schema);
    const table = Table.getRootTable(new ByteBuffer(builder.asUint8Array()));

    {
      const schemaObject = parser.toObject(table, true /* read defaults */);
      expect(schemaObject).toEqual({
        equipped_type: Equipment.Shield,
        equipped: {
          protection: -27.5,
          primary_decorator: undefined,
          primary_decorator_type: ShieldDecorator.NONE,
          decorators: [undefined],
          decorators_type: [ShieldDecorator.NONE],
        },
      });
    }

    {
      const schemaObject = parser.toObject(table, false /* read defaults */);
      expect(schemaObject).toEqual({
        equipped_type: Equipment.Shield,
        equipped: {
          protection: -27.5,
          primary_decorator: undefined,
          decorators: [undefined],
          decorators_type: [ShieldDecorator.NONE],
        },
      });
    }
  });
  it("supports empty union vector", () => {
    const schemaBuffer: Buffer = readFileSync(`${__dirname}/test/gen/Union.bfbs`);
    const schemaByteBuffer: ByteBuffer = new ByteBuffer(schemaBuffer);
    const schema = Schema.getRootAsSchema(schemaByteBuffer);

    const builder = new Builder();
    // The flatbuffers object API (i.e., the ShieldT interface) doesn't allow us to not
    // populate vectors (it always assumes that you are creating a zero-length vector).
    // In order to actually exercise empty vectors we must construct the flatbuffer table
    // directly.
    Shield.startShield(builder);
    Shield.addProtection(builder, -27.5);
    builder.finish(Shield.endShield(builder));

    const parser = new Parser(schema);
    const table = Table.getNamedTable(new ByteBuffer(builder.asUint8Array()), schema, "Shield");

    {
      const schemaObject = parser.toObject(table, false /* read defaults */);
      expect(schemaObject).toEqual({
        protection: -27.5,
      });
    }

    {
      const schemaObject = parser.toObject(table, true /* read defaults */);
      expect(schemaObject).toEqual({
        protection: -27.5,
        primary_decorator: undefined,
        primary_decorator_type: ShieldDecorator.NONE,
      });
    }
  });
  // In theory this could be supported but is not currently supported so we test that we correctly
  // throw.
  it("no support for union of struct", () => {
    const schemaBuffer: Buffer = readFileSync(`${__dirname}/test/gen/UnionStruct.bfbs`);
    const schemaByteBuffer: ByteBuffer = new ByteBuffer(schemaBuffer);
    const schema = Schema.getRootAsSchema(schemaByteBuffer);

    const unionStruct = new UnionStructT();

    unionStruct.kind = new StructBT(3);
    unionStruct.kindType = Kind.StructB;

    const builder = new Builder();
    UnionStruct.finishUnionStructBuffer(builder, unionStruct.pack(builder));

    const parser = new Parser(schema);
    const table = Table.getRootTable(new ByteBuffer(builder.asUint8Array()));

    expect(() => {
      parser.toObject(table);
    }).toThrow("Union with struct element is not currently supported");
  });
  it("converts uint8 vectors to uint8arrays", () => {
    const builder = new Builder();
    const data = ByteVector.createDataVector(builder, [1, 2, 3]);
    ByteVector.startByteVector(builder);
    ByteVector.addData(builder, data);
    const byteVector = ByteVector.endByteVector(builder);
    builder.finish(byteVector);
    // the underlying buffer for the builder is larger than the uint8array of the data
    // this needs to be cleared so that the reading from the buffer by the parser doesn't use the wrong offsets
    // normally when this is written to a file, only the contents of the Uint8Array are written, not the underlying buffer
    // so this replicates that
    // essentially need to make sure byteVectorBB.bytes().buffer !== builder.asUint8Array().buffer
    const byteVectorBB = new ByteBuffer(Uint8Array.from(builder.asUint8Array()));

    const byteVectorSchemaByteBuffer = new ByteBuffer(
      readFileSync(`${__dirname}/test/gen/ByteVector.bfbs`),
    );
    const rawSchema = Schema.getRootAsSchema(byteVectorSchemaByteBuffer);
    const parser = new Parser(rawSchema);
    const table = Table.getNamedTable(byteVectorBB, rawSchema, "ByteVector");
    const byteVectorObject = parser.toObject(table);
    expect(byteVectorObject["data"]).toEqual(new Uint8Array([1, 2, 3]));
  });
  it("reads flatbuffer structs", () => {
    const builder = new Builder();
    const struct = NestedStruct.createNestedStruct(builder, 971);
    ByteVector.startByteVector(builder);
    ByteVector.addNestedStruct(builder, struct);
    const byteVector = ByteVector.endByteVector(builder);
    builder.finish(byteVector);
    const byteVectorBB = new ByteBuffer(Uint8Array.from(builder.asUint8Array()));

    const byteVectorSchemaByteBuffer = new ByteBuffer(
      readFileSync(`${__dirname}/test/gen/ByteVector.bfbs`),
    );
    const rawSchema = Schema.getRootAsSchema(byteVectorSchemaByteBuffer);
    const parser = new Parser(rawSchema);
    const table = Table.getNamedTable(byteVectorBB, rawSchema, "ByteVector");
    const byteVectorObject = parser.toObject(table);
    expect(byteVectorObject).toEqual({ nested_struct: { a: 971 } });
  });
  it("converts uint8 vectors to uint8arrays in an offset Uint8Array source", () => {
    const builder = new Builder();
    const data = ByteVector.createDataVector(builder, [1, 2, 3]);
    ByteVector.startByteVector(builder);
    ByteVector.addData(builder, data);
    const byteVector = ByteVector.endByteVector(builder);
    builder.finish(byteVector);
    const paddingLength = 10;
    const backingBuffer = new Uint8Array(builder.asUint8Array().length + paddingLength);
    backingBuffer.set(new Array(paddingLength).fill(0));
    backingBuffer.set(builder.asUint8Array(), paddingLength);
    const byteVectorBB = new ByteBuffer(
      new Uint8Array(backingBuffer.buffer, paddingLength, backingBuffer.length - paddingLength),
    );
    const byteVectorSchemaByteBuffer = new ByteBuffer(
      readFileSync(`${__dirname}/test/gen/ByteVector.bfbs`),
    );
    const rawSchema = Schema.getRootAsSchema(byteVectorSchemaByteBuffer);
    const parser = new Parser(rawSchema);
    const table = Table.getNamedTable(byteVectorBB, rawSchema, "ByteVector");
    const byteVectorObject = parser.toObject(table);
    expect(byteVectorObject["data"]).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("rejects invalid table offsets and vtables", () => {
    expect(() => Table.getRootTable(new ByteBuffer(new Uint8Array([6, 0, 0])))).toThrow(
      "Attempt to parse root table offset from 0, which would extend beyond ByteBuffer (capacity 3)",
    );

    expect(() => Table.getRootTable(new ByteBuffer(new Uint8Array([255, 255, 255, 255])))).toThrow(
      "Attempt to construct Table with offset 4294967295, which would extend beyond ByteBuffer (capacity 4)",
    );

    expect(() =>
      Table.getRootTable(new ByteBuffer(new Uint8Array([6, 0, 0, 0, 0, 0, 0, 0]))),
    ).toThrow(
      "Attempt to construct Table with offset 6, which would extend beyond ByteBuffer (capacity 8)",
    );

    expect(() =>
      Table.getRootTable(new ByteBuffer(new Uint8Array([4, 0, 0, 0, 5, 0, 0, 0]))),
    ).toThrow(
      "Table at offset 4 points to vtable at -1 (4 - 5), which would extend beyond the ByteBuffer (capacity 8)",
    );

    expect(() =>
      Table.getRootTable(new ByteBuffer(new Uint8Array([4, 0, 0, 0, 255, 255, 255, 255]))),
    ).toThrow(
      "Table at offset 4 points to vtable at 5 (4 - -1), which would extend beyond the ByteBuffer (capacity 8)",
    );

    expect(() =>
      Table.getRootTable(
        new ByteBuffer(new Uint8Array([4, 0, 0, 0, 252, 255, 255, 255, 3, 0, 0, 0])),
      ),
    ).toThrow(
      "Table at offset 4 points to vtable at 8 (4 - -4), which specifies vtable size 3, which should be at least 4 (vtable size + object size)",
    );

    expect(() =>
      Table.getRootTable(
        new ByteBuffer(new Uint8Array([4, 0, 0, 0, 252, 255, 255, 255, 5, 0, 0, 0])),
      ),
    ).toThrow(
      "Table at offset 4 points to vtable at 8 (4 - -4), which specifies vtable size 5, which would extend beyond the ByteBuffer (capacity 12)",
    );

    expect(() =>
      Table.getRootTable(
        new ByteBuffer(new Uint8Array([4, 0, 0, 0, 252, 255, 255, 255, 4, 0, 1, 0])),
      ),
    ).toThrow(
      "Table at offset 4 points to vtable at 8 (4 - -4), which specifies inline object size 1, which should be at least 4 (vtable offset)",
    );

    expect(() =>
      Table.getRootTable(
        new ByteBuffer(new Uint8Array([4, 0, 0, 0, 252, 255, 255, 255, 4, 0, 9, 0])),
      ),
    ).toThrow(
      "Table at offset 4 points to vtable at 8 (4 - -4), which specifies inline object size 9, which would extend beyond the ByteBuffer (capacity 12)",
    );

    expect(() =>
      Table.getRootTable(
        new ByteBuffer(new Uint8Array([4, 0, 0, 0, 252, 255, 255, 255, 4, 0, 8, 0])),
      ),
    ).not.toThrow();
  });

  it("performs bounds checking for scalars", () => {
    const reflectionSchemaBuffer = readFileSync(`${__dirname}/vendor/gen/reflection.bfbs`);
    const schema = Schema.getRootAsSchema(new ByteBuffer(reflectionSchemaBuffer));
    const parser = new Parser(schema);

    const builder = new Builder();
    const docOffsets = [builder.createString("abc"), builder.createString("def")];
    const docVector = EnumVal.createDocumentationVector(builder, docOffsets);
    const nameOffset = builder.createString("name");
    Type.startType(builder);
    Type.addBaseType(builder, BaseType.Int);
    Type.addIndex(builder, 123);
    const typeOffset = Type.endType(builder);
    EnumVal.startEnumVal(builder);
    EnumVal.addName(builder, nameOffset);
    EnumVal.addValue(builder, BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1));
    EnumVal.addDocumentation(builder, docVector);
    EnumVal.addUnionType(builder, typeOffset);
    builder.finish(EnumVal.endEnumVal(builder));
    const array = builder.asUint8Array();

    array[12] = 255;
    const fbBuffer = new ByteBuffer(array);

    const reflectionFb = Table.getNamedTable(fbBuffer, schema, "reflection.EnumVal");
    expect(() => parser.toObject(reflectionFb)).toThrow(
      "Attempt to read scalar type 9 (size 8) at offset 275, which would extend beyond ByteBuffer (capacity 112)",
    );
  });

  it("reads arrays", () => {
    const schema = Schema.getRootAsSchema(
      new ByteBuffer(readFileSync(`${__dirname}/test/gen/ArraysTable.bfbs`)),
    );
    const parser = new Parser(schema);

    const arraysTable = new ArraysTableT(
      [new Point3bT([1, 2, 3])],
      [new Point3sT([500, 501, 502])],
      1,
      [new Point3iT([100_000, 100_001, 100_002])],
      [new Point3lT(0, [1_000_000n, 1_000_001n, 1_000_002n])],
      [new Point3fT([1.5, 2.5, 3.5])],
      [new Point3dT([1.1, 2.1, 3.1])],
      [new Point3eT([Color.Red, Color.Green, Color.Blue])],
      new Mat3x3bT([
        new Point3bT([10, 11, 12]),
        new Point3bT([13, 14, 15]),
        new Point3bT([16, 17, 18]),
      ]),
      new Mat3x3sT([
        new Point3sT([20, 21, 22]),
        new Point3sT([23, 24, 25]),
        new Point3sT([26, 27, 28]),
      ]),
      1,
      new Mat3x3iT([
        new Point3iT([30, 31, 32]),
        new Point3iT([33, 34, 35]),
        new Point3iT([36, 37, 38]),
      ]),
      new Mat3x3lT(1, [
        new Point3lT(0, [40n, 41n, 42n]),
        new Point3lT(0, [43n, 44n, 45n]),
        new Point3lT(0, [46n, 47n, 48n]),
      ]),
      new Mat3x3fT([
        new Point3fT([1.5, 2.5, 3.5]),
        new Point3fT([4.5, 5.5, 6.5]),
        new Point3fT([7.5, 8.5, 9.5]),
      ]),
      new Mat3x3dT([
        new Point3dT([1.1, 2.1, 3.1]),
        new Point3dT([4.1, 5.1, 6.1]),
        new Point3dT([7.1, 8.1, 9.1]),
      ]),
      new Mat3x3eT([
        new Point3eT([Color.Red, Color.Green, Color.Blue]),
        new Point3eT([Color.Green, Color.Red, Color.Blue]),
        new Point3eT([Color.Green, Color.Blue, Color.Red]),
      ]),
    );

    const builder = new Builder();
    ArraysTable.finishArraysTableBuffer(builder, arraysTable.pack(builder));
    const fbBuffer = new ByteBuffer(builder.asUint8Array());

    const table = Table.getRootTable(fbBuffer);
    expect(parser.toObject(table)).toEqual({
      point3b_vec: arraysTable.point3bVec.map((p) => ({ ...p })),
      point3s_vec: arraysTable.point3sVec.map((p) => ({ ...p })),
      pad1: 1,
      point3i_vec: arraysTable.point3iVec.map((p) => ({ ...p })),
      point3l_vec: arraysTable.point3lVec.map((p) => ({ ...p })),
      point3f_vec: arraysTable.point3fVec.map((p) => ({ ...p })),
      point3d_vec: arraysTable.point3dVec.map((p) => ({ ...p })),
      point3e_vec: arraysTable.point3eVec.map((p) => ({ ...p })),
      mat3x3b: { cols: arraysTable.mat3x3b?.cols.map((p) => ({ ...p })) },
      mat3x3s: { cols: arraysTable.mat3x3s?.cols.map((p) => ({ ...p })) },
      pad2: 1,
      mat3x3i: { cols: arraysTable.mat3x3i?.cols.map((p) => ({ ...p })) },
      mat3x3l: { pad1: 1, cols: arraysTable.mat3x3l?.cols.map((p) => ({ ...p })) },
      mat3x3f: { cols: arraysTable.mat3x3f?.cols.map((p) => ({ ...p })) },
      mat3x3d: { cols: arraysTable.mat3x3d?.cols.map((p) => ({ ...p })) },
      mat3x3e: { cols: arraysTable.mat3x3e?.cols.map((p) => ({ ...p })) },
    });
  });

  it("supports optional scalars with read defaults", () => {
    const schema = Schema.getRootAsSchema(
      new ByteBuffer(readFileSync(`${__dirname}/test/gen/OptionalScalar.bfbs`)),
    );
    const parser = new Parser(schema);

    const optionalScalar = new OptionalScalarT(undefined, undefined);

    const builder = new Builder();
    OptionalScalar.finishOptionalScalarBuffer(builder, optionalScalar.pack(builder));
    const fbBuffer = new ByteBuffer(builder.asUint8Array());

    const table = Table.getRootTable(fbBuffer);

    const schemaObjectWithoutDefaults = parser.toObject(table, false /* read defaults */);

    expect(schemaObjectWithoutDefaults).toEqual({
      regular_field: undefined,
      optional_field: null,
    });

    const schemaObjectWithDefaults = parser.toObject(table, true /* read defaults */);
    expect(schemaObjectWithDefaults).toEqual({
      regular_field: 0,
      optional_field: null,
    });
  });

  it("yields the appropriate value for an optional field when set", () => {
    const schema = Schema.getRootAsSchema(
      new ByteBuffer(readFileSync(`${__dirname}/test/gen/OptionalScalar.bfbs`)),
    );
    const parser = new Parser(schema);

    const optionalScalar = new OptionalScalarT(10, 42);

    const builder = new Builder();
    OptionalScalar.finishOptionalScalarBuffer(builder, optionalScalar.pack(builder));
    const fbBuffer = new ByteBuffer(builder.asUint8Array());

    const table = Table.getRootTable(fbBuffer);

    const schemaObjectWithoutDefaults = parser.toObject(table, true);

    expect(schemaObjectWithoutDefaults).toEqual({
      regular_field: 10,
      optional_field: 42,
    });
  });
});

function makeParser(fields: FieldT[]): Parser {
  const root = new Object_T("Root", fields);
  const builder = new Builder();
  builder.finish(new SchemaT([root], [], null, null, root).pack(builder));
  return new Parser(Schema.getRootAsSchema(new ByteBuffer(builder.asUint8Array())));
}

describe("compiled readers", () => {
  it("caches readers separately for each default mode and supports recursive tables", () => {
    const parser = makeParser([
      new FieldT("next", new TypeT(BaseType.Obj, BaseType.None, 0), 0, 4),
      new FieldT("value", new TypeT(BaseType.Int), 1, 6),
    ]);
    const decode = parser.toObjectLambda(-1);
    expect(parser.toObjectLambda(-1)).toBe(decode);
    const withDefaults = parser.toObjectLambda(-1, true);
    expect(withDefaults).not.toBe(decode);
    expect(parser.toObjectLambda(-1, true)).toBe(withDefaults);
    const builder = new Builder();
    builder.startObject(2);
    const child = builder.endObject();
    builder.startObject(2);
    builder.addFieldOffset(0, child, 0);
    builder.addFieldInt32(1, 42, 0);
    builder.finish(builder.endObject());
    const table = Table.getRootTable(new ByteBuffer(builder.asUint8Array()));
    expect(decode(table)).toEqual({ next: {}, value: 42 });
    expect(withDefaults(table)).toEqual({ next: { value: 0 }, value: 42 });
    expect(parser.toObject(table)).toEqual(decode(table));
  });

  it("does not retain incomplete readers after a schema compilation error", () => {
    const parser = makeParser([
      new FieldT("next", new TypeT(BaseType.Obj, BaseType.None, 0), 0, 4),
      new FieldT("unsupported", new TypeT(BaseType.Vector64), 1, 6),
    ]);
    expect(() => parser.toObjectLambda(-1)).toThrow("Unsupported BaseType");
    expect(() => parser.toObjectLambda(-1)).toThrow("Unsupported BaseType");
    expect(() => parser.toObjectLambda(0)).toThrow("Unsupported BaseType");
  });

  it("advances over NONE entries before populated union vector entries", () => {
    const schema = Schema.getRootAsSchema(
      new ByteBuffer(readFileSync(`${__dirname}/test/gen/Union.bfbs`)),
    );
    const shield = new ShieldT();
    shield.decoratorsType = [
      ShieldDecorator.NONE,
      ShieldDecorator.Skull,
      ShieldDecorator.NONE,
      ShieldDecorator.Arms,
    ];
    shield.decorators = [new GemstoneT(1), new SkullT("skull"), new GemstoneT(2), new ArmsT(12)];
    const builder = new Builder();
    builder.finish(shield.pack(builder));
    const parser = new Parser(schema);
    const table = Table.getNamedTable(new ByteBuffer(builder.asUint8Array()), schema, "Shield");
    expect(parser.toObject(table).decorators).toEqual([
      undefined,
      { name: "skull" },
      undefined,
      { count: 12 },
    ]);
  });
});

describe("scalar vector readers", () => {
  const cases = [
    {
      type: BaseType.Bool,
      size: 1,
      values: [false, true],
      // eslint-disable-next-line @foxglove/no-boolean-parameters -- Writes boolean data, not an option.
      write: (view: DataView, offset: number, isSet: boolean) => {
        view.setUint8(offset, Number(isSet));
      },
    },
    {
      type: BaseType.Byte,
      size: 1,
      values: [-128, 0, 127],
      write: (view: DataView, offset: number, value: number) => {
        view.setInt8(offset, value);
      },
    },
    {
      type: BaseType.UType,
      size: 1,
      values: [0, 127, 255],
      write: (view: DataView, offset: number, value: number) => {
        view.setUint8(offset, value);
      },
    },
    {
      type: BaseType.UByte,
      size: 1,
      values: [0, 127, 255],
      write: (view: DataView, offset: number, value: number) => {
        view.setUint8(offset, value);
      },
    },
    {
      type: BaseType.Short,
      size: 2,
      values: [-32768, 0, 32767],
      write: (view: DataView, offset: number, value: number) => {
        view.setInt16(offset, value, true);
      },
    },
    {
      type: BaseType.UShort,
      size: 2,
      values: [0, 65535],
      write: (view: DataView, offset: number, value: number) => {
        view.setUint16(offset, value, true);
      },
    },
    {
      type: BaseType.Int,
      size: 4,
      values: [-2147483648, 0, 2147483647],
      write: (view: DataView, offset: number, value: number) => {
        view.setInt32(offset, value, true);
      },
    },
    {
      type: BaseType.UInt,
      size: 4,
      values: [0, 4294967295],
      write: (view: DataView, offset: number, value: number) => {
        view.setUint32(offset, value, true);
      },
    },
    {
      type: BaseType.Long,
      size: 8,
      values: [-9223372036854775808n, 0n, 9223372036854775807n],
      write: (view: DataView, offset: number, value: bigint) => {
        view.setBigInt64(offset, value, true);
      },
    },
    {
      type: BaseType.ULong,
      size: 8,
      values: [0n, 18446744073709551615n],
      write: (view: DataView, offset: number, value: bigint) => {
        view.setBigUint64(offset, value, true);
      },
    },
    {
      type: BaseType.Float,
      size: 4,
      values: [-0, 1.5, -Infinity, Infinity, NaN],
      write: (view: DataView, offset: number, value: number) => {
        view.setFloat32(offset, value, true);
      },
    },
    {
      type: BaseType.Double,
      size: 8,
      values: [-0, 1.1, -Infinity, Infinity, NaN],
      write: (view: DataView, offset: number, value: number) => {
        view.setFloat64(offset, value, true);
      },
    },
  ];
  it.each(cases)(
    "decodes type $type at unaligned backing-buffer offsets",
    ({ type, size, values, write }) => {
      const parser = makeParser([new FieldT("values", new TypeT(BaseType.Vector, type), 0, 4)]);
      const decode = parser.toObjectLambda(-1);
      // Manually lay out a root table and its scalar vector. Align relative to the message,
      // while deliberately leaving the message unaligned in its larger backing buffer.
      const bytes = new Uint8Array(new ArrayBuffer(128), 3, 24 + size * values.length);
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      view.setUint32(0, 12, true);
      view.setUint16(4, 6, true);
      view.setUint16(6, 8, true);
      view.setUint16(8, 4, true);
      view.setInt32(12, 8, true);
      view.setUint32(16, 4, true);
      view.setUint32(20, values.length, true);
      for (let i = 0; i < values.length; i++) {
        // The discriminated test cases couple each values array with its matching writer.
        (write as (view: DataView, offset: number, value: number | bigint | boolean) => void)(
          view,
          24 + size * i,
          values[i]!,
        );
      }
      const table = Table.getRootTable(new ByteBuffer(bytes));
      const expected = type === BaseType.UByte ? Uint8Array.from(values as number[]) : values;
      expect(decode(table).values).toEqual(expected);
      expect(decode(table).values.buffer).toBe(type === BaseType.UByte ? bytes.buffer : undefined);
      // A larger backing allocation must not allow reads past this message's view.
      view.setUint32(20, values.length + 1, true);
      expect(() => decode(table)).toThrow("Scalar range");
      view.setInt32(20, -1, true);
      expect(() => decode(table)).toThrow("Scalar range");
      view.setUint32(20, 0, true);
      expect(decode(table).values).toEqual(type === BaseType.UByte ? new Uint8Array() : []);
      view.setUint16(8, 0, true);
      expect(decode(table)).toEqual({});
    },
  );
});
