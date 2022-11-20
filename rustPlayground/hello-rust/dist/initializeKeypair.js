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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.airdropSolIfNeeded = exports.initializeKeypair = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const fs = __importStar(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function initializeKeypair(connection) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.PRIVATE_KEY) {
            console.log("Creating .env file");
            const signer = web3.Keypair.generate();
            fs.writeFileSync(".env", `PRIVATE_KEY=[${signer.secretKey.toString()}]`);
            yield airdropSolIfNeeded(signer, connection);
            return signer;
        }
        const secret = JSON.parse((_a = process.env.PRIVATE_KEY) !== null && _a !== void 0 ? _a : "");
        const secretKey = Uint8Array.from(secret);
        const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey);
        yield airdropSolIfNeeded(keypairFromSecretKey, connection);
        return keypairFromSecretKey;
    });
}
exports.initializeKeypair = initializeKeypair;
function airdropSolIfNeeded(signer, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const balance = yield connection.getBalance(signer.publicKey);
        console.log("Current balance is", balance / web3.LAMPORTS_PER_SOL);
        if (balance < web3.LAMPORTS_PER_SOL) {
            console.log("Airdropping 1 SOL...");
            const airdropSignature = yield connection.requestAirdrop(signer.publicKey, web3.LAMPORTS_PER_SOL);
            const latestBlockHash = yield connection.getLatestBlockhash();
            yield connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: airdropSignature,
            });
            const newBalance = yield connection.getBalance(signer.publicKey);
            console.log("New balance is", newBalance / web3.LAMPORTS_PER_SOL);
        }
    });
}
exports.airdropSolIfNeeded = airdropSolIfNeeded;
//# sourceMappingURL=initializeKeypair.js.map