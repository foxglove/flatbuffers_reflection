// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers';



export class NestedStruct implements flatbuffers.IUnpackableObject<NestedStructT> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):NestedStruct {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

a():number {
  return this.bb!.readInt32(this.bb_pos);
}

static sizeOf():number {
  return 4;
}

static createNestedStruct(builder:flatbuffers.Builder, a: number):flatbuffers.Offset {
  builder.prep(4, 4);
  builder.writeInt32(a);
  return builder.offset();
}


unpack(): NestedStructT {
  return new NestedStructT(
    this.a()
  );
}


unpackTo(_o: NestedStructT): void {
  _o.a = this.a();
}
}

export class NestedStructT implements flatbuffers.IGeneratedObject {
constructor(
  public a: number = 0
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  return NestedStruct.createNestedStruct(builder,
    this.a
  );
}
}