"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3 = __importStar(require("@solana/web3.js"));
const borsh = __importStar(require("@project-serum/borsh"));
const initializeKeypair_1 = require("./initializeKeypair");
const noteInstructionLayout = borsh.struct([
    borsh.u8("variant"),
    borsh.str("title"),
    borsh.str("body"),
    borsh.u8("id"),
]);
function createNote(signer, programId, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        let buffer = Buffer.alloc(1000);
        let title = "Hello World";
        let body = "This is a note";
        // let id = anchor.BN(1);
        let id = new borsh.u64(1);
        noteInstructionLayout.encode({ variant: 0, title, body, id }, buffer);
        const fittedBuffer = buffer.slice(0, noteInstructionLayout.getSpan(buffer));
        const [pda] = yield web3.PublicKey.findProgramAddress([signer.publicKey.toBuffer(), Buffer.from(title)], programId);
        console.log("PDA: ", pda.toBase58());
        const transaction = new web3.Transaction();
        const instruction = new web3.TransactionInstruction({
            programId,
            data: fittedBuffer,
            keys: [
                { pubkey: signer.publicKey, isSigner: true, isWritable: false },
                { pubkey: pda, isSigner: false, isWritable: true },
                {
                    pubkey: web3.SystemProgram.programId,
                    isSigner: false,
                    isWritable: false,
                },
            ],
        });
        transaction.add(instruction);
        const tx = yield web3.sendAndConfirmTransaction(connection, transaction, [
            signer,
        ]);
        console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
        return tx;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
        const programId = new web3.PublicKey("4Urzd4Y2of3jjCDo9uGCqZxYSwP7WHhXtwgbxQrpYNKx");
        const wallet = yield initializeKeypair_1.initializeKeypair(connection);
        yield initializeKeypair_1.airdropSolIfNeeded(wallet, connection);
        const transactionSignature = yield createNote(wallet, programId, connection);
    });
}
main();
//# sourceMappingURL=client.js.map