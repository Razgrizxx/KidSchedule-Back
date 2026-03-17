export declare class CreateChildDto {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    color: string;
    avatarUrl?: string;
}
declare const UpdateChildDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateChildDto>>;
export declare class UpdateChildDto extends UpdateChildDto_base {
}
export {};
