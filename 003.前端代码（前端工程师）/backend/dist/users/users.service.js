"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                status: true,
                createdAt: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        return { ...user, id: Number(user.id) };
    }
    async updateProfile(userId, dto) {
        const data = {};
        if (dto.email !== undefined)
            data.email = dto.email;
        if (dto.avatar !== undefined)
            data.avatar = dto.avatar;
        const user = await this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                status: true,
                createdAt: true,
            },
        });
        return { ...user, id: Number(user.id) };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        const isValid = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isValid)
            throw new common_1.UnauthorizedException('原密码错误');
        const hashed = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });
        return { success: true, message: '密码修改成功' };
    }
    async bindPhone(userId, dto) {
        if (!dto.phone || dto.phone.length < 11) {
            throw new common_1.BadRequestException('请输入有效的手机号');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { phone: dto.phone },
        });
        return { success: true, message: '手机绑定成功' };
    }
    async getPreferences(userId) {
        let pref = await this.prisma.userPreference.findUnique({
            where: { userId },
        });
        if (!pref) {
            pref = await this.prisma.userPreference.create({
                data: { userId },
            });
        }
        return {
            ...pref,
            id: Number(pref.id),
            userId: Number(pref.userId),
            pageSize: String(pref.pageSize),
        };
    }
    async updatePreferences(userId, dto) {
        const data = {};
        if (dto.defaultPage !== undefined)
            data.defaultPage = dto.defaultPage;
        if (dto.pageSize !== undefined)
            data.pageSize = parseInt(dto.pageSize);
        if (dto.reminderEnabled !== undefined)
            data.reminderEnabled = dto.reminderEnabled ? 1 : 0;
        let pref = await this.prisma.userPreference.findUnique({
            where: { userId },
        });
        if (!pref) {
            pref = await this.prisma.userPreference.create({
                data: { userId, ...data },
            });
        }
        else {
            pref = await this.prisma.userPreference.update({
                where: { userId },
                data,
            });
        }
        return {
            ...pref,
            id: Number(pref.id),
            userId: Number(pref.userId),
            pageSize: String(pref.pageSize),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map