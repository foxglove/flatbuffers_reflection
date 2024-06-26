// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers';

import { BaseType } from '../reflection/base-type';


export class Type implements flatbuffers.IUnpackableObject<TypeT> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):Type {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsType(bb:flatbuffers.ByteBuffer, obj?:Type):Type {
  return (obj || new Type()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsType(bb:flatbuffers.ByteBuffer, obj?:Type):Type {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new Type()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

baseType():BaseType {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt8(this.bb_pos + offset) : BaseType.None;
}

element():BaseType {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readInt8(this.bb_pos + offset) : BaseType.None;
}

index():number {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : -1;
}

fixedLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 10);
  return offset ? this.bb!.readUint16(this.bb_pos + offset) : 0;
}

/**
 * The size (octets) of the `base_type` field.
 */
baseSize():number {
  const offset = this.bb!.__offset(this.bb_pos, 12);
  return offset ? this.bb!.readUint32(this.bb_pos + offset) : 4;
}

/**
 * The size (octets) of the `element` field, if present.
 */
elementSize():number {
  const offset = this.bb!.__offset(this.bb_pos, 14);
  return offset ? this.bb!.readUint32(this.bb_pos + offset) : 0;
}

static startType(builder:flatbuffers.Builder) {
  builder.startObject(6);
}

static addBaseType(builder:flatbuffers.Builder, baseType:BaseType) {
  builder.addFieldInt8(0, baseType, BaseType.None);
}

static addElement(builder:flatbuffers.Builder, element:BaseType) {
  builder.addFieldInt8(1, element, BaseType.None);
}

static addIndex(builder:flatbuffers.Builder, index:number) {
  builder.addFieldInt32(2, index, -1);
}

static addFixedLength(builder:flatbuffers.Builder, fixedLength:number) {
  builder.addFieldInt16(3, fixedLength, 0);
}

static addBaseSize(builder:flatbuffers.Builder, baseSize:number) {
  builder.addFieldInt32(4, baseSize, 4);
}

static addElementSize(builder:flatbuffers.Builder, elementSize:number) {
  builder.addFieldInt32(5, elementSize, 0);
}

static endType(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createType(builder:flatbuffers.Builder, baseType:BaseType, element:BaseType, index:number, fixedLength:number, baseSize:number, elementSize:number):flatbuffers.Offset {
  Type.startType(builder);
  Type.addBaseType(builder, baseType);
  Type.addElement(builder, element);
  Type.addIndex(builder, index);
  Type.addFixedLength(builder, fixedLength);
  Type.addBaseSize(builder, baseSize);
  Type.addElementSize(builder, elementSize);
  return Type.endType(builder);
}

unpack(): TypeT {
  return new TypeT(
    this.baseType(),
    this.element(),
    this.index(),
    this.fixedLength(),
    this.baseSize(),
    this.elementSize()
  );
}


unpackTo(_o: TypeT): void {
  _o.baseType = this.baseType();
  _o.element = this.element();
  _o.index = this.index();
  _o.fixedLength = this.fixedLength();
  _o.baseSize = this.baseSize();
  _o.elementSize = this.elementSize();
}
}

export class TypeT implements flatbuffers.IGeneratedObject {
constructor(
  public baseType: BaseType = BaseType.None,
  public element: BaseType = BaseType.None,
  public index: number = -1,
  public fixedLength: number = 0,
  public baseSize: number = 4,
  public elementSize: number = 0
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  return Type.createType(builder,
    this.baseType,
    this.element,
    this.index,
    this.fixedLength,
    this.baseSize,
    this.elementSize
  );
}
}
