// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers';



export class Sword implements flatbuffers.IUnpackableObject<SwordT> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):Sword {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsSword(bb:flatbuffers.ByteBuffer, obj?:Sword):Sword {
  return (obj || new Sword()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsSword(bb:flatbuffers.ByteBuffer, obj?:Sword):Sword {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new Sword()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

name():string|null
name(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
name(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

damage():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readInt16(this.bb_pos + offset) : 0;
}

static startSword(builder:flatbuffers.Builder) {
  builder.startObject(2);
}

static addName(builder:flatbuffers.Builder, nameOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, nameOffset, 0);
}

static addDamage(builder:flatbuffers.Builder, damage:number) {
  builder.addFieldInt16(1, damage, 0);
}

static endSword(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createSword(builder:flatbuffers.Builder, nameOffset:flatbuffers.Offset, damage:number):flatbuffers.Offset {
  Sword.startSword(builder);
  Sword.addName(builder, nameOffset);
  Sword.addDamage(builder, damage);
  return Sword.endSword(builder);
}

unpack(): SwordT {
  return new SwordT(
    this.name(),
    this.damage()
  );
}


unpackTo(_o: SwordT): void {
  _o.name = this.name();
  _o.damage = this.damage();
}
}

export class SwordT implements flatbuffers.IGeneratedObject {
constructor(
  public name: string|Uint8Array|null = null,
  public damage: number = 0
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const name = (this.name !== null ? builder.createString(this.name!) : 0);

  return Sword.createSword(builder,
    name,
    this.damage
  );
}
}
