import * as borsh from "@project-serum/borsh";

export class Movie {
  title: string;
  rating: number;
  description: string;

  constructor(title: string, rating: number, description: string) {
    this.title = title;
    this.rating = rating;
    this.description = description;
  }

  // order matters here
  // at first I used borsh.u8 for all
  // this resulted in the error: {code: -32003, message: 'failed to send transaction: Transaction simulation…cessing Instruction 0: Program failed to complete'}

  borshInstructionSchema = borsh.struct([
    borsh.u8("variant"), // this represents which function to be called / instruction to be executed
    borsh.str("title"),
    borsh.u8("rating"),
    borsh.str("description"),
  ]);

  serialize(): Buffer {
    const buffer = Buffer.alloc(1000);
    // data to encode and where to store it
    this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer);
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
  }

  // new schema, similar to the one above except has initalized not variant
  // also note title and rating have switched places!!
  // placing them as in the original resulted in RangeError: Trying to access beyond buffer length     at checkOffset
  // very puzzling

  static borshAccountSchema = borsh.struct([
    borsh.bool("initialized"),
    borsh.u8("rating"),
    borsh.str("title"),
    borsh.str("description"),
  ]);

  // we make it static so we can call it without creating an instance of the class
  static deserialize(buffer: Buffer): Movie {
    if (!buffer) {
      // unsure if this is needed in TS
      return null;
    }
    try {
      const { title, rating, description } = this.borshAccountSchema.decode(
        buffer
      );
      return new Movie(title, rating, description);
    } catch (error) {
      // if the account has no data in it we will get an error
      console.log("Deserialization error", error);
      return null;
    }
  }

  static mocks: Movie[] = [
    new Movie(
      "The Shawshank Redemption",
      5,
      `For a movie shot entirely in prison where there is no hope at all, shawshank redemption's main massage and purpose is to remind us of hope, that even in the darkest places hope exists, and only needs someone to find it. Combine this message with a brilliant screenplay, lovely characters and Martin freeman, and you get a movie that can teach you a lesson everytime you watch it. An all time Classic!!!`
    ),
    new Movie(
      "The Godfather",
      5,
      `One of Hollywood's greatest critical and commercial successes, The Godfather gets everything right; not only did the movie transcend expectations, it established new benchmarks for American cinema.`
    ),
    new Movie(
      "The Godfather: Part II",
      4,
      `The Godfather: Part II is a continuation of the saga of the late Italian-American crime boss, Francis Ford Coppola, and his son, Vito Corleone. The story follows the continuing saga of the Corleone family as they attempt to successfully start a new life for themselves after years of crime and corruption.`
    ),
    new Movie(
      "The Dark Knight",
      5,
      `The Dark Knight is a 2008 superhero film directed, produced, and co-written by Christopher Nolan. Batman, in his darkest hour, faces his greatest challenge yet: he must become the symbol of the opposite of the Batmanian order, the League of Shadows.`
    ),
  ];
}
