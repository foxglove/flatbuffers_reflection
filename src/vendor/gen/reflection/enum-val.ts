// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers';

import { KeyValue, KeyValueT } from '../reflection/key-value';
import { Type, TypeT } from '../reflection/type';


export class EnumVal implements flatbuffers.IUnpackableObject<EnumValT> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):EnumVal {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsEnumVal(bb:flatbuffers.ByteBuffer, obj?:EnumVal):EnumVal {
  return (obj || new EnumVal()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsEnumVal(bb:flatbuffers.ByteBuffer, obj?:EnumVal):EnumVal {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new EnumVal()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

name():string|null
name(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
name(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

value():bigint {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readInt64(this.bb_pos + offset) : BigInt('0');
}

unionType(obj?:Type):Type|null {
  const offset = this.bb!.__offset(this.bb_pos, 10);
  return offset ? (obj || new Type()).__init(this.bb!.__indirect(this.bb_pos + offset), this.bb!) : null;
}

documentation(index: number):string
documentation(index: number,optionalEncoding:flatbuffers.Encoding):string|Uint8Array
documentation(index: number,optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 12);
  return offset ? this.bb!.__string(this.bb!.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
}

documentationLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 12);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

attributes(index: number, obj?:KeyValue):KeyValue|null {
  const offset = this.bb!.__offset(this.bb_pos, 14);
  return offset ? (obj || new KeyValue()).__init(this.bb!.__indirect(this.bb!.__vector(this.bb_pos + offset) + index * 4), this.bb!) : null;
}

attributesLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 14);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

static startEnumVal(builder:flatbuffers.Builder) {
  builder.startObject(6);
}

static addName(builder:flatbuffers.Builder, nameOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, nameOffset, 0);
}

static addValue(builder:flatbuffers.Builder, value:bigint) {
  builder.addFieldInt64(1, value, BigInt('0'));
}

static addUnionType(builder:flatbuffers.Builder, unionTypeOffset:flatbuffers.Offset) {
  builder.addFieldOffset(3, unionTypeOffset, 0);
}

static addDocumentation(builder:flatbuffers.Builder, documentationOffset:flatbuffers.Offset) {
  builder.addFieldOffset(4, documentationOffset, 0);
}

static createDocumentationVector(builder:flatbuffers.Builder, data:flatbuffers.Offset[]):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addOffset(data[i]!);
  }
  return builder.endVector();
}

static startDocumentationVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static addAttributes(builder:flatbuffers.Builder, attributesOffset:flatbuffers.Offset) {
  builder.addFieldOffset(5, attributesOffset, 0);
}

static createAttributesVector(builder:flatbuffers.Builder, data:flatbuffers.Offset[]):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addOffset(data[i]!);
  }
  return builder.endVector();
}

static startAttributesVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static endEnumVal(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  builder.requiredField(offset, 4) // name
  return offset;
}


unpack(): EnumValT {
  return new EnumValT(
    this.name(),
    this.value(),
    (this.unionType() !== null ? this.unionType()!.unpack() : null),
    this.bb!.createScalarList<string>(this.documentation.bind(this), this.documentationLength()),
    this.bb!.createObjList<KeyValue, KeyValueT>(this.attributes.bind(this), this.attributesLength())
  );
}


unpackTo(_o: EnumValT): void {
  _o.name = this.name();
  _o.value = this.value();
  _o.unionType = (this.unionType() !== null ? this.unionType()!.unpack() : null);
  _o.documentation = this.bb!.createScalarList<string>(this.documentation.bind(this), this.documentationLength());
  _o.attributes = this.bb!.createObjList<KeyValue, KeyValueT>(this.attributes.bind(this), this.attributesLength());
}
}

export class EnumValT implements flatbuffers.IGeneratedObject {
constructor(
  public name: string|Uint8Array|null = null,
  public value: bigint = BigInt('0'),
  public unionType: TypeT|null = null,
  public documentation: (string)[] = [],
  public attributes: (KeyValueT)[] = []
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const name = (this.name !== null ? builder.createString(this.name!) : 0);
  const unionType = (this.unionType !== null ? this.unionType!.pack(builder) : 0);
  const documentation = EnumVal.createDocumentationVector(builder, builder.createObjectOffsetList(this.documentation));
  const attributes = EnumVal.createAttributesVector(builder, builder.createObjectOffsetList(this.attributes));

  EnumVal.startEnumVal(builder);
  EnumVal.addName(builder, name);
  EnumVal.addValue(builder, this.value);
  EnumVal.addUnionType(builder, unionType);
  EnumVal.addDocumentation(builder, documentation);
  EnumVal.addAttributes(builder, attributes);

  return EnumVal.endEnumVal(builder);
}
}
