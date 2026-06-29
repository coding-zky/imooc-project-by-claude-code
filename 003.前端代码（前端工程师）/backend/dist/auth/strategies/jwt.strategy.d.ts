import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
interface JwtPayload {
    sub: bigint;
    username: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        id: bigint;
        username: string;
        email: string | null;
        avatar: string | null;
    }>;
}
export {};
