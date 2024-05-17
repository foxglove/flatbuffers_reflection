// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers';



export class Point3s implements flatbuffers.IUnpackableObject<Point3sT> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):Point3s {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

xyz(index: number):number|null {
    return this.bb!.readInt16(this.bb_pos + 0 + index * 2);
}

static sizeOf():number {
  return 6;
}

static createPoint3s(builder:flatbuffers.Builder, xyz: number[]|null):flatbuffers.Offset {
  builder.prep(2, 6);

  for (let i = 2; i >= 0; --i) {
    builder.writeInt16((xyz?.[i] ?? 0));

  }

  return builder.offset();
}


unpack(): Point3sT {
  return new Point3sT(
    this.bb!.createScalarList<number>(this.xyz.bind(this), 3)
  );
}


unpackTo(_o: Point3sT): void {
  _o.xyz = this.bb!.createScalarList<number>(this.xyz.bind(this), 3);
}
}

export class Point3sT implements flatbuffers.IGeneratedObject {
constructor(
  public xyz: (number)[] = []
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  return Point3s.createPoint3s(builder,
    this.xyz
  );
}
}
