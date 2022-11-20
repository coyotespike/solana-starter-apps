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
const initializeKeypair_1 = require("./initializeKeypair");
const programId = new web3.PublicKey("CP6ET2sewmoBvmhPwFcUDbiAGRMjQ1jeVE3xd2KMHCNR");
function sayHello(connection, payer) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = new web3.Transaction();
        const instruction = new web3.TransactionInstruction({
            keys: [],
            programId,
        });
        transaction.add(instruction);
        const transactionSignature = yield web3.sendAndConfirmTransaction(connection, transaction, [payer]);
        return transactionSignature;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
        const wallet = yield initializeKeypair_1.initializeKeypair(connection);
        yield initializeKeypair_1.airdropSolIfNeeded(wallet, connection);
        const transactionSignature = yield sayHello(connection, wallet);
        console.log(`Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);
    });
}
main();
//# sourceMappingURL=client.js.map