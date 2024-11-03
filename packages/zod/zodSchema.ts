import { string, z } from 'zod';

export const SignupSchema = z.object({
    username : z.string(),
    password : z.string(),
    role : z.enum(["user","admin"])
})

export const SigninSchema = z.object({
    username : z.string(),
    password : z.string()
})

export const UpdateMetadataSchema = z.object({
    avatarId : string()
}) 