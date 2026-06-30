export declare class UpdateProfileDto {
    email?: string;
    avatar?: string;
}
export declare class ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export declare class BindPhoneDto {
    phone: string;
    code: string;
}
export declare class UpdatePreferencesDto {
    defaultPage?: string;
    pageSize?: string;
    reminderEnabled?: boolean;
}
