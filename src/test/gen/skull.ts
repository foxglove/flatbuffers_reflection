// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers';



export class Skull implements flatbuffers.IUnpackableObject<SkullT> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):Skull {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsSkull(bb:flatbuffers.ByteBuffer, obj?:Skull):Skull {
  return (obj || new Skull()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsSkull(bb:flatbuffers.ByteBuffer, obj?:Skull):Skull {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new Skull()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

name():string|null
name(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
name(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

static startSkull(builder:flatbuffers.Builder) {
  builder.startObject(1);
}

static addName(builder:flatbuffers.Builder, nameOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, nameOffset, 0);
}

static endSkull(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createSkull(builder:flatbuffers.Builder, nameOffset:flatbuffers.Offset):flatbuffers.Offset {
  Skull.startSkull(builder);
  Skull.addName(builder, nameOffset);
  return Skull.endSkull(builder);
}

unpack(): SkullT {
  return new SkullT(
    this.name()
  );
}


unpackTo(_o: SkullT): void {
  _o.name = this.name();
}
}

export class SkullT implements flatbuffers.IGeneratedObject {
constructor(
  public name: string|Uint8Array|null = null
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const name = (this.name !== null ? builder.createString(this.name!) : 0);

  return Skull.createSkull(builder,
    name
  );
}
}
