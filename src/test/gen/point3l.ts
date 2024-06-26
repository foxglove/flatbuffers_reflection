// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers';



export class Point3l implements flatbuffers.IUnpackableObject<Point3lT> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):Point3l {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

pad1():number {
  return this.bb!.readUint8(this.bb_pos);
}

xyz(index: number):bigint|null {
    return this.bb!.readInt64(this.bb_pos + 8 + index * 8);
}

static sizeOf():number {
  return 32;
}

static createPoint3l(builder:flatbuffers.Builder, pad1: number, xyz: bigint[]|null):flatbuffers.Offset {
  builder.prep(8, 32);

  for (let i = 2; i >= 0; --i) {
    builder.writeInt64(BigInt(xyz?.[i] ?? 0));
  }

  builder.pad(7);
  builder.writeInt8(pad1);
  return builder.offset();
}


unpack(): Point3lT {
  return new Point3lT(
    this.pad1(),
    this.bb!.createScalarList<bigint>(this.xyz.bind(this), 3)
  );
}


unpackTo(_o: Point3lT): void {
  _o.pad1 = this.pad1();
  _o.xyz = this.bb!.createScalarList<bigint>(this.xyz.bind(this), 3);
}
}

export class Point3lT implements flatbuffers.IGeneratedObject {
constructor(
  public pad1: number = 0,
  public xyz: (bigint)[] = []
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  return Point3l.createPoint3l(builder,
    this.pad1,
    this.xyz
  );
}
}
