// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers';

import { Mat3x3b, Mat3x3bT } from './mat3x3b';
import { Mat3x3d, Mat3x3dT } from './mat3x3d';
import { Mat3x3e, Mat3x3eT } from './mat3x3e';
import { Mat3x3f, Mat3x3fT } from './mat3x3f';
import { Mat3x3i, Mat3x3iT } from './mat3x3i';
import { Mat3x3l, Mat3x3lT } from './mat3x3l';
import { Mat3x3s, Mat3x3sT } from './mat3x3s';
import { Point3b, Point3bT } from './point3b';
import { Point3d, Point3dT } from './point3d';
import { Point3e, Point3eT } from './point3e';
import { Point3f, Point3fT } from './point3f';
import { Point3i, Point3iT } from './point3i';
import { Point3l, Point3lT } from './point3l';
import { Point3s, Point3sT } from './point3s';


export class ArraysTable implements flatbuffers.IUnpackableObject<ArraysTableT> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):ArraysTable {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsArraysTable(bb:flatbuffers.ByteBuffer, obj?:ArraysTable):ArraysTable {
  return (obj || new ArraysTable()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsArraysTable(bb:flatbuffers.ByteBuffer, obj?:ArraysTable):ArraysTable {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new ArraysTable()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

point3bVec(index: number, obj?:Point3b):Point3b|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? (obj || new Point3b()).__init(this.bb!.__vector(this.bb_pos + offset) + index * 3, this.bb!) : null;
}

point3bVecLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

point3sVec(index: number, obj?:Point3s):Point3s|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? (obj || new Point3s()).__init(this.bb!.__vector(this.bb_pos + offset) + index * 6, this.bb!) : null;
}

point3sVecLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

pad1():number {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.readUint8(this.bb_pos + offset) : 0;
}

point3iVec(index: number, obj?:Point3i):Point3i|null {
  const offset = this.bb!.__offset(this.bb_pos, 10);
  return offset ? (obj || new Point3i()).__init(this.bb!.__vector(this.bb_pos + offset) + index * 12, this.bb!) : null;
}

point3iVecLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 10);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

point3lVec(index: number, obj?:Point3l):Point3l|null {
  const offset = this.bb!.__offset(this.bb_pos, 12);
  return offset ? (obj || new Point3l()).__init(this.bb!.__vector(this.bb_pos + offset) + index * 32, this.bb!) : null;
}

point3lVecLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 12);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

point3fVec(index: number, obj?:Point3f):Point3f|null {
  const offset = this.bb!.__offset(this.bb_pos, 14);
  return offset ? (obj || new Point3f()).__init(this.bb!.__vector(this.bb_pos + offset) + index * 12, this.bb!) : null;
}

point3fVecLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 14);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

point3dVec(index: number, obj?:Point3d):Point3d|null {
  const offset = this.bb!.__offset(this.bb_pos, 16);
  return offset ? (obj || new Point3d()).__init(this.bb!.__vector(this.bb_pos + offset) + index * 24, this.bb!) : null;
}

point3dVecLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 16);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

point3eVec(index: number, obj?:Point3e):Point3e|null {
  const offset = this.bb!.__offset(this.bb_pos, 18);
  return offset ? (obj || new Point3e()).__init(this.bb!.__vector(this.bb_pos + offset) + index * 3, this.bb!) : null;
}

point3eVecLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 18);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

mat3x3b(obj?:Mat3x3b):Mat3x3b|null {
  const offset = this.bb!.__offset(this.bb_pos, 20);
  return offset ? (obj || new Mat3x3b()).__init(this.bb_pos + offset, this.bb!) : null;
}

mat3x3s(obj?:Mat3x3s):Mat3x3s|null {
  const offset = this.bb!.__offset(this.bb_pos, 22);
  return offset ? (obj || new Mat3x3s()).__init(this.bb_pos + offset, this.bb!) : null;
}

pad2():number {
  const offset = this.bb!.__offset(this.bb_pos, 24);
  return offset ? this.bb!.readUint8(this.bb_pos + offset) : 0;
}

mat3x3i(obj?:Mat3x3i):Mat3x3i|null {
  const offset = this.bb!.__offset(this.bb_pos, 26);
  return offset ? (obj || new Mat3x3i()).__init(this.bb_pos + offset, this.bb!) : null;
}

mat3x3l(obj?:Mat3x3l):Mat3x3l|null {
  const offset = this.bb!.__offset(this.bb_pos, 28);
  return offset ? (obj || new Mat3x3l()).__init(this.bb_pos + offset, this.bb!) : null;
}

mat3x3f(obj?:Mat3x3f):Mat3x3f|null {
  const offset = this.bb!.__offset(this.bb_pos, 30);
  return offset ? (obj || new Mat3x3f()).__init(this.bb_pos + offset, this.bb!) : null;
}

mat3x3d(obj?:Mat3x3d):Mat3x3d|null {
  const offset = this.bb!.__offset(this.bb_pos, 32);
  return offset ? (obj || new Mat3x3d()).__init(this.bb_pos + offset, this.bb!) : null;
}

mat3x3e(obj?:Mat3x3e):Mat3x3e|null {
  const offset = this.bb!.__offset(this.bb_pos, 34);
  return offset ? (obj || new Mat3x3e()).__init(this.bb_pos + offset, this.bb!) : null;
}

static startArraysTable(builder:flatbuffers.Builder) {
  builder.startObject(16);
}

static addPoint3bVec(builder:flatbuffers.Builder, point3bVecOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, point3bVecOffset, 0);
}

static startPoint3bVecVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(3, numElems, 1);
}

static addPoint3sVec(builder:flatbuffers.Builder, point3sVecOffset:flatbuffers.Offset) {
  builder.addFieldOffset(1, point3sVecOffset, 0);
}

static startPoint3sVecVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(6, numElems, 2);
}

static addPad1(builder:flatbuffers.Builder, pad1:number) {
  builder.addFieldInt8(2, pad1, 0);
}

static addPoint3iVec(builder:flatbuffers.Builder, point3iVecOffset:flatbuffers.Offset) {
  builder.addFieldOffset(3, point3iVecOffset, 0);
}

static startPoint3iVecVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(12, numElems, 4);
}

static addPoint3lVec(builder:flatbuffers.Builder, point3lVecOffset:flatbuffers.Offset) {
  builder.addFieldOffset(4, point3lVecOffset, 0);
}

static startPoint3lVecVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(32, numElems, 8);
}

static addPoint3fVec(builder:flatbuffers.Builder, point3fVecOffset:flatbuffers.Offset) {
  builder.addFieldOffset(5, point3fVecOffset, 0);
}

static startPoint3fVecVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(12, numElems, 4);
}

static addPoint3dVec(builder:flatbuffers.Builder, point3dVecOffset:flatbuffers.Offset) {
  builder.addFieldOffset(6, point3dVecOffset, 0);
}

static startPoint3dVecVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(24, numElems, 8);
}

static addPoint3eVec(builder:flatbuffers.Builder, point3eVecOffset:flatbuffers.Offset) {
  builder.addFieldOffset(7, point3eVecOffset, 0);
}

static startPoint3eVecVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(3, numElems, 1);
}

static addMat3x3b(builder:flatbuffers.Builder, mat3x3bOffset:flatbuffers.Offset) {
  builder.addFieldStruct(8, mat3x3bOffset, 0);
}

static addMat3x3s(builder:flatbuffers.Builder, mat3x3sOffset:flatbuffers.Offset) {
  builder.addFieldStruct(9, mat3x3sOffset, 0);
}

static addPad2(builder:flatbuffers.Builder, pad2:number) {
  builder.addFieldInt8(10, pad2, 0);
}

static addMat3x3i(builder:flatbuffers.Builder, mat3x3iOffset:flatbuffers.Offset) {
  builder.addFieldStruct(11, mat3x3iOffset, 0);
}

static addMat3x3l(builder:flatbuffers.Builder, mat3x3lOffset:flatbuffers.Offset) {
  builder.addFieldStruct(12, mat3x3lOffset, 0);
}

static addMat3x3f(builder:flatbuffers.Builder, mat3x3fOffset:flatbuffers.Offset) {
  builder.addFieldStruct(13, mat3x3fOffset, 0);
}

static addMat3x3d(builder:flatbuffers.Builder, mat3x3dOffset:flatbuffers.Offset) {
  builder.addFieldStruct(14, mat3x3dOffset, 0);
}

static addMat3x3e(builder:flatbuffers.Builder, mat3x3eOffset:flatbuffers.Offset) {
  builder.addFieldStruct(15, mat3x3eOffset, 0);
}

static endArraysTable(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static finishArraysTableBuffer(builder:flatbuffers.Builder, offset:flatbuffers.Offset) {
  builder.finish(offset);
}

static finishSizePrefixedArraysTableBuffer(builder:flatbuffers.Builder, offset:flatbuffers.Offset) {
  builder.finish(offset, undefined, true);
}


unpack(): ArraysTableT {
  return new ArraysTableT(
    this.bb!.createObjList<Point3b, Point3bT>(this.point3bVec.bind(this), this.point3bVecLength()),
    this.bb!.createObjList<Point3s, Point3sT>(this.point3sVec.bind(this), this.point3sVecLength()),
    this.pad1(),
    this.bb!.createObjList<Point3i, Point3iT>(this.point3iVec.bind(this), this.point3iVecLength()),
    this.bb!.createObjList<Point3l, Point3lT>(this.point3lVec.bind(this), this.point3lVecLength()),
    this.bb!.createObjList<Point3f, Point3fT>(this.point3fVec.bind(this), this.point3fVecLength()),
    this.bb!.createObjList<Point3d, Point3dT>(this.point3dVec.bind(this), this.point3dVecLength()),
    this.bb!.createObjList<Point3e, Point3eT>(this.point3eVec.bind(this), this.point3eVecLength()),
    (this.mat3x3b() !== null ? this.mat3x3b()!.unpack() : null),
    (this.mat3x3s() !== null ? this.mat3x3s()!.unpack() : null),
    this.pad2(),
    (this.mat3x3i() !== null ? this.mat3x3i()!.unpack() : null),
    (this.mat3x3l() !== null ? this.mat3x3l()!.unpack() : null),
    (this.mat3x3f() !== null ? this.mat3x3f()!.unpack() : null),
    (this.mat3x3d() !== null ? this.mat3x3d()!.unpack() : null),
    (this.mat3x3e() !== null ? this.mat3x3e()!.unpack() : null)
  );
}


unpackTo(_o: ArraysTableT): void {
  _o.point3bVec = this.bb!.createObjList<Point3b, Point3bT>(this.point3bVec.bind(this), this.point3bVecLength());
  _o.point3sVec = this.bb!.createObjList<Point3s, Point3sT>(this.point3sVec.bind(this), this.point3sVecLength());
  _o.pad1 = this.pad1();
  _o.point3iVec = this.bb!.createObjList<Point3i, Point3iT>(this.point3iVec.bind(this), this.point3iVecLength());
  _o.point3lVec = this.bb!.createObjList<Point3l, Point3lT>(this.point3lVec.bind(this), this.point3lVecLength());
  _o.point3fVec = this.bb!.createObjList<Point3f, Point3fT>(this.point3fVec.bind(this), this.point3fVecLength());
  _o.point3dVec = this.bb!.createObjList<Point3d, Point3dT>(this.point3dVec.bind(this), this.point3dVecLength());
  _o.point3eVec = this.bb!.createObjList<Point3e, Point3eT>(this.point3eVec.bind(this), this.point3eVecLength());
  _o.mat3x3b = (this.mat3x3b() !== null ? this.mat3x3b()!.unpack() : null);
  _o.mat3x3s = (this.mat3x3s() !== null ? this.mat3x3s()!.unpack() : null);
  _o.pad2 = this.pad2();
  _o.mat3x3i = (this.mat3x3i() !== null ? this.mat3x3i()!.unpack() : null);
  _o.mat3x3l = (this.mat3x3l() !== null ? this.mat3x3l()!.unpack() : null);
  _o.mat3x3f = (this.mat3x3f() !== null ? this.mat3x3f()!.unpack() : null);
  _o.mat3x3d = (this.mat3x3d() !== null ? this.mat3x3d()!.unpack() : null);
  _o.mat3x3e = (this.mat3x3e() !== null ? this.mat3x3e()!.unpack() : null);
}
}

export class ArraysTableT implements flatbuffers.IGeneratedObject {
constructor(
  public point3bVec: (Point3bT)[] = [],
  public point3sVec: (Point3sT)[] = [],
  public pad1: number = 0,
  public point3iVec: (Point3iT)[] = [],
  public point3lVec: (Point3lT)[] = [],
  public point3fVec: (Point3fT)[] = [],
  public point3dVec: (Point3dT)[] = [],
  public point3eVec: (Point3eT)[] = [],
  public mat3x3b: Mat3x3bT|null = null,
  public mat3x3s: Mat3x3sT|null = null,
  public pad2: number = 0,
  public mat3x3i: Mat3x3iT|null = null,
  public mat3x3l: Mat3x3lT|null = null,
  public mat3x3f: Mat3x3fT|null = null,
  public mat3x3d: Mat3x3dT|null = null,
  public mat3x3e: Mat3x3eT|null = null
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const point3bVec = builder.createStructOffsetList(this.point3bVec, ArraysTable.startPoint3bVecVector);
  const point3sVec = builder.createStructOffsetList(this.point3sVec, ArraysTable.startPoint3sVecVector);
  const point3iVec = builder.createStructOffsetList(this.point3iVec, ArraysTable.startPoint3iVecVector);
  const point3lVec = builder.createStructOffsetList(this.point3lVec, ArraysTable.startPoint3lVecVector);
  const point3fVec = builder.createStructOffsetList(this.point3fVec, ArraysTable.startPoint3fVecVector);
  const point3dVec = builder.createStructOffsetList(this.point3dVec, ArraysTable.startPoint3dVecVector);
  const point3eVec = builder.createStructOffsetList(this.point3eVec, ArraysTable.startPoint3eVecVector);

  ArraysTable.startArraysTable(builder);
  ArraysTable.addPoint3bVec(builder, point3bVec);
  ArraysTable.addPoint3sVec(builder, point3sVec);
  ArraysTable.addPad1(builder, this.pad1);
  ArraysTable.addPoint3iVec(builder, point3iVec);
  ArraysTable.addPoint3lVec(builder, point3lVec);
  ArraysTable.addPoint3fVec(builder, point3fVec);
  ArraysTable.addPoint3dVec(builder, point3dVec);
  ArraysTable.addPoint3eVec(builder, point3eVec);
  ArraysTable.addMat3x3b(builder, (this.mat3x3b !== null ? this.mat3x3b!.pack(builder) : 0));
  ArraysTable.addMat3x3s(builder, (this.mat3x3s !== null ? this.mat3x3s!.pack(builder) : 0));
  ArraysTable.addPad2(builder, this.pad2);
  ArraysTable.addMat3x3i(builder, (this.mat3x3i !== null ? this.mat3x3i!.pack(builder) : 0));
  ArraysTable.addMat3x3l(builder, (this.mat3x3l !== null ? this.mat3x3l!.pack(builder) : 0));
  ArraysTable.addMat3x3f(builder, (this.mat3x3f !== null ? this.mat3x3f!.pack(builder) : 0));
  ArraysTable.addMat3x3d(builder, (this.mat3x3d !== null ? this.mat3x3d!.pack(builder) : 0));
  ArraysTable.addMat3x3e(builder, (this.mat3x3e !== null ? this.mat3x3e!.pack(builder) : 0));

  return ArraysTable.endArraysTable(builder);
}
}
