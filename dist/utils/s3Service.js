"use strict";
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
exports.deleteImageFromS3 = exports.s3 = void 0;
exports.uploadImageToS3 = uploadImageToS3;
// S3 upload function
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = __importDefault(require("../config/config"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.s3 = new aws_sdk_1.default.S3({
    accessKeyId: config_1.default.awsAccessKey,
    secretAccessKey: config_1.default.awsSecretKey,
    region: config_1.default.awsRegion,
});
function uploadImageToS3(file) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const key = `profile-pics/${Date.now()}-${file.originalname}`;
            const params = {
                Bucket: config_1.default.awsBucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            const { Location } = yield exports.s3.upload(params).promise();
            // return Location;
            return { url: Location, key };
        }
        catch (error) {
            console.error('Error uploading to S3:', error);
            throw new Error('Failed to upload image');
        }
    });
}
const deleteImageFromS3 = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Bucket: config_1.default.awsBucketName,
        Key: key,
    };
    yield exports.s3.deleteObject(params).promise();
});
exports.deleteImageFromS3 = deleteImageFromS3;
